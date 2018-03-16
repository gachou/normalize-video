/*!
 * normalize-video <https://github.com/gachou/normalize-video>
 *
 * Copyright (c) 2018 Nils Knappmeier.
 * Released under the MIT license.
 */
const {fileInfo, writeTags} = require('./metadata')
const targets = require('./targets')
const cp = require('child_process')
const pify = require('pify')
const utimes = pify(require('fs').utimes)
const path = require('path')

module.exports = normalizeVideo

/**
 * Convert the input video to mp4-format with the least possible quality loss
 * @param {string} inputFile
 * @param {string|null} targetFile
 * @param {object} options
 * @param {string} options.aspect the target aspect-ratio (e.g. 16:9)
 * @param {function(...*)} options.logger a function consuming log entries
 * @public
 */
async function normalizeVideo (inputFile, targetFile, options) {
  const opts = {
    dryRun: false,
    logger: () => {}, // noop
    ...options
  }

  if (targetFile == null) {
    targetFile = inputFile + '.converted.mp4'
  }

  // Use only mp4 for now
  const targetFormat = targets.mp4
  let extname = path.extname(targetFile)
  if (extname !== targetFormat.extension) {
    throw new Error(`Invalid extension of target file (expected: ${targetFormat.extension}, found: ${extname}`)
  }

  const sourceFileInfo = await fileInfo(inputFile)

  function computeSettings (streamType) {
    if (sourceFileInfo.streams[streamType]) { // ... compute settings, if the stream exists in the source file
      return targetFormat[streamType].computeSettings(sourceFileInfo.streams[streamType])
    } else {
      return []
    }
  }

  let aspectRatio = opts.aspect ? ['-aspect', opts.aspect ] : []
  let args = [
    ...computeSettings('video'),
    ...aspectRatio,
    ...computeSettings('audio'),
    ...computeSettings('subtitle'),
    '-f', opts.dryRun ? 'null' : targetFormat.format // -f null is like dry-run for ffmpeg
  ]

  await ffmpeg(inputFile, targetFile, args, opts.logger)

  const targetTags = {...sourceFileInfo.exiftool}
  const creationDateTags = ['XMP:CreateDate', 'QuickTime:CreateDate']
  // Find first relevant create date tag
  const relevantCreationDateTag = creationDateTags.find((tag) => targetTags[tag]) || 'File:FileModifyDate'
  // Rewrite all creation date tags to this value
  creationDateTags.forEach((tag) => {
    targetTags[tag] = targetTags[relevantCreationDateTag]
  })
  await writeTags(targetFile, targetTags)

  await utimes(targetFile, new Date(), new Date(targetTags['File:FileModifyDate']))
}

async function ffmpeg (input, output, args, logger) {
  return new Promise((resolve, reject) => {
    let executable = 'ffmpeg'
    let cliArgs = ['-v', 'info', '-i', input, ...args, output]
    logger({label: 'run ffmpeg', executable, cliArgs})
    const child = cp.spawn(executable, cliArgs, {stdio: 'inherit'})
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('Unexpected exit code of ffmpeg: ' + code)))
  })
}

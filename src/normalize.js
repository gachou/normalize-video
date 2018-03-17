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
const rename = pify(require('fs').rename)
const path = require('path')
// Regex that matches that file extension
const fileExtensionRegex = /\.([^.]+)$/

module.exports = normalizeVideo

/**
 * Convert the input video to mp4-format with the least possible quality loss
 * @param {string} inputFile
 * @param {object=} options
 * @param {string=} options.targetFile
 * @param {string=} options.aspect the target aspect-ratio (e.g. 16:9)
 * @param {function(...*)=} options.logger a function consuming log entries
 * @public
 */
async function normalizeVideo (inputFile, options) {
  const opts = {
    dryRun: false,
    targetFile: inputFile.replace(fileExtensionRegex, '.mp4'),
    logger: () => {}, // noop
    ...options
  }

  const tmpFile = opts.targetFile + '.tmp.mp4'

  // Use only mp4 for now
  const targetSpec = targets.mp4
  let extname = path.extname(opts.targetFile)
  if (extname !== targetSpec.extension) {
    throw new Error(`Invalid extension of target file (expected: ${targetSpec.extension}, found: ${extname}`)
  }

  const sourceFileInfo = await fileInfo(inputFile)

  let aspectRatio = opts.aspect ? ['-aspect', opts.aspect] : []
  let args = [
    ...computeSettings(sourceFileInfo, targetSpec, 'video'),
    ...aspectRatio,
    ...computeSettings(sourceFileInfo, targetSpec, 'audio'),
    ...computeSettings(sourceFileInfo, targetSpec, 'subtitle'),
    '-f', opts.dryRun ? 'null' : targetSpec.format // -f null is like dry-run for ffmpeg
  ]

  await ffmpeg(inputFile, tmpFile, args, opts.logger)

  const targetTags = {...sourceFileInfo.exiftool}
  const creationDateTags = ['XMP:CreateDate', 'QuickTime:CreateDate']
    // Find first relevant create date tag
  const relevantCreationDateTag = creationDateTags.find((tag) => targetTags[tag]) || 'File:FileModifyDate'
    // Rewrite all creation date tags to this value
  creationDateTags.forEach((tag) => {
    targetTags[tag] = targetTags[relevantCreationDateTag]
  })
  await writeTags(tmpFile, targetTags)

  await utimes(tmpFile, new Date(), new Date(targetTags['File:FileModifyDate']))
  if (opts.targetFile) {
    await rename(inputFile, inputFile.replace(fileExtensionRegex, '.original.$1'))
  }
  await rename(tmpFile, opts.targetFile)
  return opts.targetFile
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

function computeSettings (sourceFileInfo, targetSpec, streamType) {
  if (sourceFileInfo.streams[streamType]) { // ... compute settings, if the stream exists in the source file
    return targetSpec[streamType].computeSettings(sourceFileInfo.streams[streamType])
  } else {
    return []
  }
}

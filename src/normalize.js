/*!
 * normalize-video <https://github.com/gachou/normalize-video>
 *
 * Copyright (c) 2018 Nils Knappmeier.
 * Released under the MIT license.
 */
const path = require('path')
const fs = require('fs')
const {fileInfo} = require('./probe')
const targets = require('./targets')
const cp = require('child_process')

module.exports = normalizeVideo

/**
 * Convert the input video to mp4-format with the least possible quality loss
 * @param {string} inputFile
 * @param {object} options
 * @param {function(...*)} options.logger a function consuming log entries
 * @public
 */
async function normalizeVideo (inputFile, options) {
  const opts = {
    dryRun: false,
    logger: () => {}, // noop
    ...options
  }

  // Use only mp4 for now
  const targetFile = inputFile.replace(/\..*?$/, '.mp4')
  const targetFormat = targets.mp4

  const sourceFileInfo = await fileInfo(inputFile)

  let computeSettings = (streamType) => targetFormat[streamType].computeSettings(sourceFileInfo.streams[streamType])
  let args = [
    ...computeSettings('video'),
    ...computeSettings('audio'),
    ...computeSettings('subtitle'),
    '-f', opts.dryRun ? 'null' : targetFormat.format // -f null is like dry-run for ffmpeg
  ]

  await ffmpeg(inputFile, targetFile, args, options.logger)
}

async function ffmpeg (input, output, args, logger) {
  return new Promise((resolve, reject) => {
    let cliArgs = ['-v', 'info', '-i', input, ...args, output]
    logger('Running: ffmpeg ' + cliArgs.map((arg) => `'${arg}'`).join(' '))
    cp.execFile('ffmpeg', cliArgs, (err, stdout, stderr) => {
      if (err) {
        console.error(stdout, stderr)
        return reject(err)
      }
      resolve(stdout)
    })
  })
}

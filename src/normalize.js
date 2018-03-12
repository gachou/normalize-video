/*!
 * normalize-video <https://github.com/gachou/normalize-video>
 *
 * Copyright (c) 2018 Nils Knappmeier.
 * Released under the MIT license.
 */
const path = require('path')
const pify = require('pify')
const execFile = pify(require('child_process').execFile)

module.exports = normalizeVideo

/**
 * Describe your module here
 * @public
 */
async function normalizeVideo (inputFile, options) {
  const opts = {
    dryRun: false,
    ...options
  }

  const targetFile = inputFile.replace(/\.*?$/, '.mp4')

  console.log(await codecs(inputFile))
  if (opts.dryRun) {
    console.log(inputFile, '->', targetFile)
  }
}

async function codecs (file) {
  const ffprobe = JSON.parse(await execFile(
    'ffprobe',
    ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', file]
  ))
  console.log('ffprobe', ffprobe)
  const result = {}
  ffprobe.streams.forEach(function (stream) {
    if (result[stream.codec_type]) {
      throw new Error(`Multiple streams of the same type are not supported: Found "${stream.codec_type}" twice in "${file}"`)
    }
    result[stream.codec_type] = {
      codec: stream.codec_name
    }
  })
  return {
    format: ffprobe.format.format_name,
    streams: result
  }
}

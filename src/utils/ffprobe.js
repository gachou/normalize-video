const cp = require('child_process')

module.exports = ffProbe

/**
 * Return information about the video file
 * @param file
 * @return {Promise.<{file: *, format: *, streams: {}, exiftool: *}>}
 */
async function ffProbe (file) {
  const ffprobeData = await execFFProbe(file, '-show_format', '-show_streams')
  const streams = {}
  // Index by codec_type (video, audio, subtitle)
  ffprobeData.streams.forEach(function (stream) {
    if (streams[stream.codec_type]) {
      throw new Error(`Multiple streams of the same type are not supported: Found "${stream.codec_type}" twice in "${file}"`)
    }
    streams[stream.codec_type] = stream
  })
  return {
    file: file,
    format: ffprobeData.format.format_name,
    streams
  }
}

async function execFFProbe (file, ...args) {
  return new Promise((resolve, reject) => {
    cp.execFile('ffprobe', ['-print_format', 'json', ...args, file], (err, stdout, stderr) => {
      if (err) {
        console.error(stdout, stderr)
        return reject(err)
      }
      resolve(JSON.parse(stdout))
    })
  })
}

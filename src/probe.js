const cp = require('child_process')

module.exports = {ffprobe, fileInfo, exiftool}

/**
 * Return information about the video file
 * @param file
 * @return {Promise.<{file: *, format: *, streams: {}, exiftool: *}>}
 */
async function fileInfo (file) {
  const [ffprobeData, exiftoolData] = await Promise.all([
    ffprobe(file, '-show_format', '-show_streams'),
    await exiftool(file, '-XMP:*', '-CreateDate', '-FileModifyDate')
  ])

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
    streams,
    exiftool: exiftoolData
  }
}

async function ffprobe (file, ...args) {
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

async function exiftool (file, ...args) {
  return new Promise((resolve, reject) => {
    cp.execFile('exiftool', ['-j', '-G', '-struct', '-dateFormat', '%Y-%m-%dT%H:%M:%S%z', ...args, file], (err, stdout, stderr) => {
      if (err) {
        console.error(stdout, stderr)
        return reject(err)
      }
      let exifData = JSON.parse(stdout)[0]
      delete exifData['SourceFile']
      resolve(exifData)
    })
  })

}

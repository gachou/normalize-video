const _ = {
  pick: require('lodash.pick')
}

/**
 * Strip fileInfo down to fewer tags to make the test more readable
 * @param fileInfo
 * @return {{}}
 */
module.exports = function stripInfo (fileInfo) {
  return {
    exiftool: fileInfo.exiftool,
    file: fileInfo.file,
    format: fileInfo.format,
    streams: {
      video: _.pick(fileInfo.streams.video, 'codec_name', 'codec_type'),
      audio: _.pick(fileInfo.streams.audio, 'codec_name', 'codec_type'),
      subtitle: _.pick(fileInfo.streams.subtitle, 'codec_name', 'codec_type')
    }
  }
}

module.exports = {
  computeSettings
}

/**
 *
 *
 * https://trac.ffmpeg.org/wiki/Encode/AAC
 */
function computeSettings (streamProbe) {
  const result = []
  switch (streamProbe.codec_name) {
    case 'hdmv_pgs_subtitle':
    case 'pgssub':
      // Subtitles are image based and cannot be converted to mov_text, so we ignore them
      // see https://stackoverflow.com/questions/36326790/cant-change-video-subtitles-codec-using-ffmpeg
      break
    case 'mov_text':
      result.push('-c:s', 'copy')
      break
    default:
      result.push('-c:s', 'mov_text')
  }
  return result
}

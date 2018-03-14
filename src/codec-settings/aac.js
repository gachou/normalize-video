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
  if (streamProbe.codec_name === 'aac') {
    result.push('-c:a', 'copy')
  } else {
    result.push('-c:a', 'aac') // Free encoder (libfdk_aac has an incompatible license)
    result.push('-b:a', '160k') // Constant bitrate because variable bitrate is experimental
  }
  return result
}

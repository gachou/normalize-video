module.exports = {
  computeSettings
}

/**
 * Configures the h264 encoder based on settings retrieved from ffprobe (use "copy" if the source is already h264)
 * The aim of these settings is to provide minimal loss in quality.
 * The source file should be deleted after converting...
 *
 * **There is no guarantee that this will always be the case. Be sure to keep a backup.**
 *
 * https://trac.ffmpeg.org/wiki/Encode/H.264
 */
function computeSettings (streamProbe) {
  const result = []
  // Preserve framerate setting (seems not to be done automatically when convertign from mts to mp4, even with "copy"
  if (streamProbe.avg_frame_rate) {
    result.push('-r', streamProbe.avg_frame_rate)
  }
  if (streamProbe.codec_name === 'h264') {
    result.push('-c:v', 'copy')
  } else {
    result.push('-c:v', 'libx264')
    result.push('-crf', '17') // visually lossless
    result.push('-preset',)
    result.push('-tune', 'film') // high quality movies
  }
  return result
}

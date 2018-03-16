module.exports = {
  mp4: {
    video: require('./codec-settings/h264'),
    audio: require('./codec-settings/aac'),
    subtitle: require('./codec-settings/mov_text'),
    format: 'mp4', // format for ffmpeg "-f" option
    extension: '.mp4'
  }
}

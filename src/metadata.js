
const exiftool = require('./utils/exiftool')
const ffProbe = require('./utils/ffprobe')

async function fileInfo (file) {
  const [ffProbeData, exiftoolData] = await Promise.all([ffProbe(file), exiftool.readTags(file)])
  return {
    ...ffProbeData,
    exiftool: exiftoolData
  }
}

module.exports = {fileInfo, writeTags: exiftool.writeTags}

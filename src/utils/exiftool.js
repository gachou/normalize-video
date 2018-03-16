const cp = require('child_process')

module.exports = {readTags, writeTags}

/**
 * Return information about the video file
 * @param file
 * @return {Promise.<{object}>}
 */
async function readTags (file) {
  const stdout = await exifTool(file, null, '-j', '-XMP:*', '-CreateDate', '-FileModifyDate')
  let exifData = JSON.parse(stdout)[0]
  delete exifData['SourceFile']
  return exifData
}

/**
 *
 * @param {string} file
 * @param {object} tags something like
 * ```json
 * {
 *   "File:FileModifyDate": "2015-02-15T12:03:58+0100"
 *   "QuickTime:CreateDate": "0000:00:00 00:00:00"
 * }
 * ```
 * @return {Promise}
 */
async function writeTags (file, tags) {
  let stdin = JSON.stringify({
    ...tags,
    'SourceFile': file
  })
  return exifTool(file, stdin, '-j=-', '-overwrite_original' )
}

/**
 * Runt the ExifTool
 * @param {string} file
 * @param stdin
 * @param args
 * @return {Promise}
 */
async function exifTool (file, stdin, ...args) {
  return new Promise((resolve, reject) => {
    const child = cp.execFile('exiftool', ['-G', '-struct', '-dateFormat', '%Y-%m-%dT%H:%M:%S%z', ...args, file], (err, stdout, stderr) => {
      if (err) {
        console.error(stdout, stderr)
        return reject(err)
      }
      resolve(stdout)
    })
    if (stdin) {
      child.stdin.end(stdin)
    }
  })
}

const pify = require('pify')
const fs = require('fs')
const utimes = pify(fs.utimes)
const rimraf = pify(require('rimraf'))
const copy = require('copy-concurrently')
const tmpDir = 'tmp/'

module.exports = {prepareFixtures, tmpDir}

/**
 * Prepare a temporary directory containing the fixture files
 * @return {Promise.<void>}
 */
async function prepareFixtures () {
  await rimraf(tmpDir)
  await copy('test/fixtures/', tmpDir)

  await Promise.all([
    utimes('tmp/2015-02-15__12-03-58-00000.mts', new Date(), new Date('2015-02-15T12:03:58+0100')),
    utimes('tmp/VID_20180313_214151.mp4', new Date(), new Date('2018-03-13T20:41:54+0100')),
    utimes('tmp/2008-06-14__16-11-38-p6140035.avi', new Date(), new Date('2008-06-14T16:11:38+0200'))
  ])
}

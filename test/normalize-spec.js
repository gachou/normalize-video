/*!
 * normalize-video <https://github.com/gachou/normalize-video>
 *
 * Copyright (c) 2018 Nils Knappmeier.
 * Released under the MIT license.
 */

/* eslint-env mocha */

const normalizeVideo = require('../')
const pify = require('pify')
const rimraf = pify(require('rimraf'))
const copy = require('copy-concurrently')
const stripInfo = require('./lib/stripInfo')
const {fileInfo} = require('../src/probe')

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const tmpDir = 'tmp'

describe('normalize-video:', function () {

  before(async () => {
    await rimraf(tmpDir)
    await copy('test/fixtures/', tmpDir)
  })

  it('should convert videos to mp4', async function () {
    const log = []
    await normalizeVideo('tmp/2015-02-15__12-03-58-00000.mts', {logger: (msg) => log.push(msg)})
    expect(log).to.deep.equal(["Running: ffmpeg '-v' 'info' '-i' 'tmp/2015-02-15__12-03-58-00000.mts' '-r' '50' '-c:v' 'copy' '-c:a' 'aac' '-b:a' '160k' '-f' 'mp4' 'tmp/2015-02-15__12-03-58-00000.mp4'"])
    expect(stripInfo(await fileInfo('tmp/2015-02-15__12-03-58-00000.mp4'))).to.deep.equal({
      'exiftool': {
        'File:FileModifyDate': '2018-03-14T23:44:00+0100',
        'QuickTime:CreateDate': '0000:00:00 00:00:00'
      },
      'file': 'tmp/2015-02-15__12-03-58-00000.mp4',
      'format': 'mov,mp4,m4a,3gp,3g2,mj2',
      'streams': {
        'audio': {
          'codec_name': 'aac',
          'codec_type': 'audio'
        },
        'subtitle': {},
        'video': {
          'avg_frame_rate': '50/1',
          'codec_name': 'h264',
          'codec_type': 'video'
        }
      }
    })
  })
})

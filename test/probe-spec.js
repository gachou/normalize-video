/*!
 * normalize-video <https://github.com/gachou/normalize-video>
 *
 * Copyright (c) 2018 Nils Knappmeier.
 * Released under the MIT license.
 */

/* eslint-env mocha */

const probe = require('../src/metadata')
const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const fs = require('fs')
const stripInfo = require('./lib/stripInfo')

describe('the fileInfo function', function () {
  it('should return a list of streams and tags contained in an mp4-file', async function () {
    let file = 'test/fixtures/VID_20180313_214151.mp4'
    fs.utimesSync(file, new Date('2018-03-13T20:41:54+0100'), new Date('2018-03-13T20:41:54+0100'))

    expect(stripInfo(await probe.fileInfo(file))).to.deep.equal({
      file,
      exiftool: {
        'QuickTime:CreateDate': '2018-03-13T20:41:54+0100',
        'File:FileModifyDate': '2018-03-13T20:41:54+0100',
        'XMP:Identifier': 'abcdefg',
        'XMP:HierarchicalSubject': ['Basement/Table/Absturzius'],
        'XMP:XMPToolkit': 'Image::ExifTool 10.10'
      },
      'format': 'mov,mp4,m4a,3gp,3g2,mj2',
      streams: {
        'audio': {
          'codec_name': 'aac',
          'codec_type': 'audio'
        },
        'subtitle': {},
        'video': {
          'codec_name': 'h264',
          'avg_frame_rate': '4410000/148751',
          'codec_type': 'video'
        }
      }
    })
  })

  it('should return a list of codecs contained in an mts-file', async function () {
    let file = 'test/fixtures/2015-02-15__12-03-58-00000.mts'
    fs.utimesSync(file, new Date('2015-02-15T12:03:58+0100'), new Date('2015-02-15T12:03:58+0100'))
    expect(stripInfo(await probe.fileInfo(file))).to.deep.equal({
      'exiftool': {
        'File:FileModifyDate': '2015-02-15T12:03:58+0100'
      },
      'file': 'test/fixtures/2015-02-15__12-03-58-00000.mts',
      'format': 'mpegts',
      'streams': {
        'audio': {
          'codec_name': 'ac3',
          'codec_type': 'audio'
        },
        'subtitle': {
          'codec_name': 'pgssub',
          'codec_type': 'subtitle'
        },
        'video': {
          'codec_name': 'h264',
          'codec_type': 'video',
          'avg_frame_rate': '50/1'
        }
      }
    })
  })
})


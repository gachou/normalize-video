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
const mkdirp = pify(require('mkdirp'))
const stripInfo = require('./lib/stripInfo')
const {fileInfo} = require('../src/metadata')

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const tmpDir = 'tmp'

describe('normalize-video:', function () {
  this.timeout(20000)
  before(async () => {
    await rimraf(tmpDir)
    await mkdirp(tmpDir)
  })

  it('should convert videos from mts to mp4', async function () {
    await verifyNormalize('test/fixtures/2015-02-15__12-03-58-00000.mts', 'tmp/2015-02-15__12-03-58-00000.mp4',
      [{
        'label': 'run ffmpeg',
        'executable': 'ffmpeg',
        'cliArgs': [
          '-v', 'info',
          '-i', 'test/fixtures/2015-02-15__12-03-58-00000.mts',
          '-r', '25/1',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '160k',
          '-f', 'mp4',
          'tmp/2015-02-15__12-03-58-00000.mp4'
        ]
      }],
      {
        'file': 'tmp/2015-02-15__12-03-58-00000.mp4',
        'exiftool': {
          // Should preserve modification date
          'File:FileModifyDate': '2015-02-15T12:03:58+0100',
          // Should set creation dates to modification date
          'QuickTime:CreateDate': '2015-02-15T12:03:58+0100',
          'XMP:CreateDate': '2015-02-15T12:03:58+0100',
          'XMP:XMPToolkit': 'Image::ExifTool 10.10'

        },
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

  it('should convert videos mp4 to mp4', async function () {
    await verifyNormalize('test/fixtures/VID_20180313_214151.mp4', 'tmp/VID_20180313_214151.mp4',
      [
        {
          'label': 'run ffmpeg',
          'executable': 'ffmpeg',
          'cliArgs': [
            '-v', 'info',
            '-i', 'test/fixtures/VID_20180313_214151.mp4',
            '-r', '4410000/148751',
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-f', 'mp4',
            'tmp/VID_20180313_214151.mp4'
          ]
        }
      ],
      {
        'exiftool': {
          'File:FileModifyDate': '2018-03-13T20:41:54+0100',
          'QuickTime:CreateDate': '2018-03-13T20:41:54+0100',
          'XMP:CreateDate': '2018-03-13T20:41:54+0100',
          'XMP:HierarchicalSubject': [
            'Basement/Table/Absturzius'
          ],
          'XMP:Identifier': 'abcdefg',
          'XMP:XMPToolkit': 'Image::ExifTool 10.10'
        },
        'file': 'tmp/VID_20180313_214151.mp4',
        'format': 'mov,mp4,m4a,3gp,3g2,mj2',
        'streams': {
          'audio': {
            'codec_name': 'aac',
            'codec_type': 'audio'
          },
          'subtitle': {},
          'video': {
            'avg_frame_rate': '927502/31285',
            'codec_name': 'h264',
            'codec_type': 'video'
          }
        }
      })
  })
  it('should convert videos avi to mp4', async function () {
    await verifyNormalize('test/fixtures/2008-06-14__16-11-38-p6140035.avi', 'tmp/2008-06-14__16-11-38-p6140035.mp4',
      [
        {
          'label': 'run ffmpeg',
          'executable': 'ffmpeg',
          'cliArgs': [
            '-v', 'info',
            '-i', 'test/fixtures/VID_20180313_214151.mp4',
            '-r', '4410000/148751',
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-f', 'mp4',
            'tmp/VID_20180313_214151.mp4'
          ]
        }
      ],
      {
        'exiftool': {
          'File:FileModifyDate': '2018-03-13T20:41:54+0100',
          'QuickTime:CreateDate': '2018-03-13T20:41:54+0100',
          'XMP:CreateDate': '2018-03-13T20:41:54+0100',
          'XMP:HierarchicalSubject': [
            'Basement/Table/Absturzius'
          ],
          'XMP:Identifier': 'abcdefg',
          'XMP:XMPToolkit': 'Image::ExifTool 10.10'
        },
        'file': 'tmp/VID_20180313_214151.mp4',
        'format': 'mov,mp4,m4a,3gp,3g2,mj2',
        'streams': {
          'audio': {
            'codec_name': 'aac',
            'codec_type': 'audio'
          },
          'subtitle': {},
          'video': {
            'avg_frame_rate': '927502/31285',
            'codec_name': 'h264',
            'codec_type': 'video'
          }
        }
      })
  })
})

async function verifyNormalize (sourceFile, targetFile, expectedLog, expectedFileInfo) {
  const log = []
  await normalizeVideo(sourceFile, targetFile, {logger: msg => log.push(msg)})
  expect(log, 'Checking execution log').to.deep.equal(expectedLog)
  expect(stripInfo(await fileInfo(targetFile))).to.deep.equal(expectedFileInfo)
}

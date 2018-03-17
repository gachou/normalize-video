/*!
 * normalize-video <https://github.com/gachou/normalize-video>
 *
 * Copyright (c) 2018 Nils Knappmeier.
 * Released under the MIT license.
 */

/* eslint-env mocha */

const normalizeVideo = require('../')
const copy = require('copy-concurrently')
const stripInfo = require('./lib/stripInfo')
const {fileInfo} = require('../src/metadata')
const fs = require('fs')
const {prepareFixtures} = require('./lib/prepareFixtures')

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

describe('normalize-video:', function () {
  this.timeout(20000)

  beforeEach(() => prepareFixtures())

  it('should convert videos from mts to mp4', async function () {
    const targetFile = await verifyNormalize('tmp/2015-02-15__12-03-58-00000.mts', 'tmp/2015-02-15__12-03-58-00000.mp4',
      [{
        'label': 'run ffmpeg',
        'executable': 'ffmpeg',
        'cliArgs': [
          '-v', 'info',
          '-i', 'tmp/2015-02-15__12-03-58-00000.mts',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '160k',
          '-f', 'mp4',
          'tmp/2015-02-15__12-03-58-00000.mp4.tmp.mp4'
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
            'codec_name': 'h264',
            'codec_type': 'video'
          }
        }
      })
    expect(targetFile).to.equal('tmp/2015-02-15__12-03-58-00000.mp4')
  })

  it('should convert videos mp4 to mp4', async function () {
    const targetFile = await verifyNormalize('tmp/VID_20180313_214151.mp4', 'tmp/VID_20180313_214151.mp4',
      [
        {
          'label': 'run ffmpeg',
          'executable': 'ffmpeg',
          'cliArgs': [
            '-v', 'info',
            '-i', 'tmp/VID_20180313_214151.mp4',
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-f', 'mp4',
            'tmp/VID_20180313_214151.mp4.tmp.mp4'
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
            'codec_name': 'h264',
            'codec_type': 'video'
          }
        }
      })
    expect(targetFile).to.equal('tmp/VID_20180313_214151.mp4')
  })
  it('should convert videos avi to mp4', async function () {
    const targetFile = await verifyNormalize('tmp/2008-06-14__16-11-38-p6140035.avi', 'tmp/2008-06-14__16-11-38-p6140035.mp4',
      [
        {
          'label': 'run ffmpeg',
          'executable': 'ffmpeg',
          'cliArgs': [
            '-v', 'info',
            '-i', 'tmp/2008-06-14__16-11-38-p6140035.avi',
            '-r', '500000/33333',
            '-c:v', 'libx264',
            '-crf', '17',
            '-preset', 'veryslow',
            '-tune', 'film',
            '-f', 'mp4',
            'tmp/2008-06-14__16-11-38-p6140035.mp4.tmp.mp4']
        }
      ],
      {
        'exiftool': {
          'File:FileModifyDate': '2008-06-14T16:11:38+0200',
          'QuickTime:CreateDate': '2008-06-14T16:11:38+0200',
          'XMP:CreateDate': '2008-06-14T16:11:38+0200',
          'XMP:XMPToolkit': 'Image::ExifTool 10.10'
        },
        'file': 'tmp/2008-06-14__16-11-38-p6140035.mp4',
        'format': 'mov,mp4,m4a,3gp,3g2,mj2',
        'streams': {
          'audio': {},
          'subtitle': {},
          'video': {
            'codec_name': 'h264',
            'codec_type': 'video'
          }
        }
      })
    expect(targetFile).to.equal('tmp/2008-06-14__16-11-38-p6140035.mp4')
  })

  describe('if no target name is specified', function () {
    it('should rename the original image to ".original.ext"', async function () {
      await copy('tmp/2015-02-15__12-03-58-00000.mts', 'tmp/test-2015.mts')
      const targetFile = await normalizeVideo('tmp/test-2015.mts')
      expect(targetFile).to.equal('tmp/test-2015.mp4')
      expect(fs.existsSync(targetFile)).be.true()
      compareFiles('tmp/test-2015.original.mts', 'test/fixtures/2015-02-15__12-03-58-00000.mts')
    })

    it('should work if the implicit target name equals the original', async function () {
      await copy('tmp/VID_20180313_214151.mp4', 'tmp/test-2018.mp4')
      const targetFile = await normalizeVideo('tmp/test-2018.mp4')
      expect(targetFile).to.equal('tmp/test-2018.mp4')
      expect(fs.existsSync(targetFile)).be.true()
      compareFiles('tmp/test-2018.original.mp4', 'test/fixtures/VID_20180313_214151.mp4')
    })
  })
})

async function verifyNormalize (sourceFile, targetFile, expectedLog, expectedFileInfo) {
  const log = []
  const realTargetFile = await normalizeVideo(sourceFile, {targetFile, logger: msg => log.push(msg)})
  expect(log, 'Checking execution log').to.deep.equal(expectedLog)
  expect(stripInfo(await fileInfo(targetFile))).to.deep.equal(expectedFileInfo)
  return realTargetFile
}

function compareFiles (actualFile, expectedFile) {
  const expected = fs.readFileSync(expectedFile)
  const actual = fs.readFileSync(actualFile)
  expect(expected, `${actualFile} should equal ${expectedFile}`).to.deep.equal(actual)
}

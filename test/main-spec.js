/*!
 * normalize-video <https://github.com/gachou/normalize-video>
 *
 * Copyright (c) 2018 Nils Knappmeier.
 * Released under the MIT license.
 */

/* eslint-env mocha */

const normalizeVideo = require('../')
const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

describe('normalize-video:', function () {
  it("should be executed", function () {
    expect(normalizeVideo()).to.equal('normalizeVideo')
  })
})

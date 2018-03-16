#!/usr/bin/env node

const normalize = require('../src/normalize')
const debug = require('debug')('normalize-video:bin')

require('yargs')
  .command(
    '$0 [files...]', 'normalize video files',
  {
    'dry-run': {
      description: 'Do not actually change anything, just perform all the checks',
      alias: 'd',
      type: 'boolean'
    },
    'aspect': {
      description: 'Set a certain aspect ratio on the target',
      alias: 'a',
      type: 'string'
    }
  },
    (argv) => {
      console.log(argv)
      Promise
        .all(argv.files.map((file) => normalize(file, null, {dryRun: argv['dry-run'], aspect: argv['aspect'], logger: debug})))
        .then(() => 'Done')
        .then(console.log, console.error)
    })
  .parse()

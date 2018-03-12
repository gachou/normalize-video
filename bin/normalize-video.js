#!/usr/bin/env node

const normalize = require('../src/normalize')

const argv = require('yargs')
  .command(
    '$0 [files...]', 'normalize video files',
    {
      'dry-run': {
        alias: 'd',
        type: 'boolean'
      }
    },
    (argv) => {
      console.log(argv)
      Promise
        .all(argv.files.map((file) => normalize(file, {dryRun:argv['dry-run']})))
        .then(() => 'Done')
        .then(console.log, console.error)
    })
  .parse()



/* eslint-disable no-console */

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
      return runNormalizeVideo(argv).then(() => console.log('done'), (err) => console.error(err))
    })
  .parse()

async function runNormalizeVideo (argv) {
  for (let i = 0; i < argv.files.length; i++) {
    const file = argv.files[i]
    try {
      await normalize(file, {dryRun: argv['dry-run'], aspect: argv['aspect'], logger: debug})
      console.log(`Done with ${file} (${i + 1}/${argv.files.length}`)
    } catch (e) {
      console.log('Error while handling ', file, `${e.message}\n${e.stack}`)
    }
  }
}

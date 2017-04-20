const test = require('tape')
const { Repository } = require('nodegit')
const { resolve } = require('path')

const exec = require('./utils/exec.js')
const git = require('../')


test('open setup', t => {
  exec('sh ./open.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass(stdout)
    t.end()
  })
  .catch(t.end)
})

test('open throw error non existing repo without init', t => {
  git.open(resolve(__dirname, 'repos/open-test'), {
    init: false
  })
  .then(() => {
    t.fail('should not open uninitialized repo')
    t.end()
  })
  .catch(error => {
    t.pass(error.message.replace(`${__dirname}/`, ''))
    t.true(error instanceof Error, 'is instace of Error')
    t.end()
  })
})

test('open and automatically init', t => {
  git.open(resolve(__dirname, './repos/open-test'))
  .then(repo => {
    t.pass('opened and initialized a repository')
    t.true(repo instanceof Repository, 'is instance of NodeGit.Repository')
    t.end()
  })
  .catch(t.end)
})

test('open git repo', t => {
  git.open(resolve(__dirname, './repos/open-git'))
  .then(repo => {
    t.pass('opened and initialized a repository')
    t.true(repo instanceof Repository, 'is instance of NodeGit.Repository')
    t.end()
  })
  .catch(t.end)
})

test('open twice', t => {
  Promise.all([
    git.open(resolve(__dirname, './repos/open-test')),
    git.open(resolve(__dirname, './repos/open-test'))
  ])
  .then(([repo1, repo2]) => {
    t.pass('opened and initialized 2 repositories')
    t.true(repo1 instanceof Repository, 'is instance of NodeGit.Repository')
    t.true(repo2 instanceof Repository, 'is instance of NodeGit.Repository')
    t.deepEqual(repo1, repo2, 'both opened repos should be deep equal')
    t.end()
  })
  .catch(t.end)
})

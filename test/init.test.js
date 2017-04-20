const test = require('tape')
const { Oid, Repository } = require('nodegit')
const { resolve } = require('path')

const exec = require('./utils/exec.js')
const git = require('../')


test('init setup', t => {
  exec('sh ./init.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass(stdout)
    t.end()
  })
  .catch(t.end)
})

test('init fail on file', t => {
  git.init(resolve(__dirname, './repos/init-git/file.txt'))
  .then(() => {
    t.fail('should not initialize repository on a file')
    t.end()
  })
  .catch(error => {
    t.pass(error.message.replace(`${__dirname}/`, ''))
    t.true(error instanceof Error, 'is instace of Error')
    t.end()
  })
})

test('init reinitialize existing repo', t => {
  git.init(resolve(__dirname, './repos/init-git'))
  .then(repo => {
    t.pass('reinitialized existing repository')
    t.true(repo instanceof Repository, 'is instance of NodeGit.Repository')
    t.end()
  })
  .catch(t.end)
})

test('init bare', t => {
  git.init(resolve(__dirname, './repos/init-test-bare'), {
    bare: 1
  })
  .then(repo => {
    t.pass('initialized bare repository')
    t.true(repo instanceof Repository, 'is instance of NodeGit.Repository')
    t.end()
  })
  .catch(t.end)
})

test('init with inital commit message', t => {
  git.init(resolve(__dirname, './repos/init-test'), {
    message: 'the very first commit'
  })
  .then(repo => {
    t.pass('initialized repository with intial commit')
    t.true(repo instanceof Repository, 'is instance of NodeGit.Repository')
    t.end()
  })
  .catch(t.end)
})

test('init without initial commit', t => {
  const path = resolve(__dirname, './repos/init-test-nocommit')
  git.init(path, {
    commit: false // TODO: align with CLI, false should be default
  })
  .then(repo => {
    t.pass('initialized repository without intial commit')
    t.true(repo instanceof Repository, 'is instance of NodeGit.Repository')
    // check that repo has no commit yet
    return exec('git log', { cwd: path })
    .then(stdout => t.fail(stdout))
    .catch(error => {
      const msg = 'fatal: your current branch \'master\' does not have any commits yet'
      t.true(error.message.includes(msg), 'current branch does not have any commits')
      t.equal(error.cmd, 'git log', 'error.cmd was \'git log\'')
      t.equal(error.code, 128, 'is error.code 128')
      t.end()
    })
  })
  .catch(t.end)
})

test('init and do something before first commit', t => {
  const path = resolve(__dirname, './repos/init-test-before-commit')
  git.init(path, { // TODO: change to exec('git init')
    commit: false
  })
  // i.e. set repo configs now
  .then(repo => git.init.commit(repo, {
    message: 'first and only commit'
  }))
  .then(oid => {
    t.true(oid instanceof Oid, 'is Oid')
  })
  .then(() => exec('git log', { cwd: path }))
  .then(stdout => {
    t.true(stdout.includes('first and only commit'), 'has commit message')
    t.end()
  })
  .catch(t.end)
})

const test = require('tape')
const { Oid, Repository } = require('nodegit')
const { resolve } = require('path')
const { writeFile } = require('fildes')

const exec = require('./utils/exec.js')
const git = require('../')


test('commit setup', t => {
  exec('sh ./commit.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass(stdout)
    t.end()
  })
  .catch(t.end)
})

test('commit on fresh git repo, missing initial commit', t => {
  const path = resolve(__dirname, './repos/commit-git')

  git.open(path)
  .then(repo => {
    return git.commit(repo) // TODO: first commit bug?
    .catch(error => t.true(error instanceof Error, 'got error'))
    .then(() => git.init.commit(repo)) // TODO: :/
    .then(oid => {
      t.true(oid instanceof Oid, 'is Oid')
      return exec('git log', { cwd: path })
      .then(stdout => t.true(stdout.includes(oid), 'git log incudes oid'))
    })
    // commit nothing
    .then(() => git.commit(repo, { 'message': 'nothing to commit' }))
    .then(oid => t.equal(oid, null, 'no Oid'))
    // new file
    .then(() => writeFile(resolve(path, 'file2.txt'), 'Hello 2\n'))
    .then(() => git.commit(repo, { 'message': 'commits new file' }))
    .then(oid => {
      t.true(oid instanceof Oid, 'is instance of Oid')
      return exec('git log', { cwd: path })
      .then(stdout => t.true(stdout.includes(oid), 'git log incudes oid'))
    })
    // updates file
    .then(() => writeFile(resolve(path, 'file.txt'), 'Hello 1\n'))
    .then(() => git.commit(repo, { 'message': 'updates file' }))
    .then(oid => {
      t.true(oid instanceof Oid, 'is instance of Oid')
      return exec('git log', { cwd: path })
      .then(stdout => t.true(stdout.includes(oid), 'git log incudes oid'))
    })
    .then(() => exec('git log', { cwd: path }))
    .then(stdout => {
      t.true(stdout.includes('initial commit'), 'initial commit')
      t.true(stdout.includes('commits new file'), 'new file commit message')
      t.true(stdout.includes('updates file'), 'update file commit message')
      t.end()
    })
  })
  .catch(t.end)
})

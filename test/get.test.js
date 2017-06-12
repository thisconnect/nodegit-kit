const test = require('tape')
const { Oid, Repository } = require('nodegit')
const { resolve } = require('path')

const exec = require('./utils/exec.js')
const git = require('../')
const get = require('../lib/get.js')

test('get setup', t => {
  exec('sh get.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass('sh get.sh')
    t.end()
  })
  .catch(t.end)
})

test('get', t => {
  const path = resolve(__dirname, 'repos/get-git')

  git.open(path, { init: false })
  .then(repo => {
    return Promise.all([
      get(repo),
      exec('git rev-parse HEAD', { cwd: path }),
      exec('git rev-parse HEAD~1', { cwd: path }),
      exec('git rev-parse HEAD~2', { cwd: path })
    ])
    .then(([changes, head, head1, head2]) => {
    })
  })
  .then(t.end)
  .catch(t.end)
})

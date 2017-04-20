const test = require('tape')
const { Oid, Repository } = require('nodegit')
const { resolve } = require('path')

const exec = require('./utils/exec.js')
const git = require('../')


test('status setup', t => {
  exec('sh ./status.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass(stdout)
    t.end()
  })
  .catch(t.end)
})

test('status', t => {
  const path = resolve(__dirname, 'repos/status-git')

  git.open(path, { init: false })
  .then(repo => {
    return git.status(repo)
    .then(status => {
      t.true(Array.isArray(status), 'status is an array')
      // t.equal(status.length, 4, 'has length of four');
      // TODO: moved
      t.deepEqual(status, [
        { path: 'file.txt', status: 'modified' },
        { path: 'file2.txt', status: 'deleted' },
        { path: 'file3.txt', status: 'deleted' },
        { path: 'file4.txt', status: 'new' },
        { path: 'file5.txt', status: 'new' }
      ])
    })
  })
  .then(t.end)
  .catch(t.end)
})

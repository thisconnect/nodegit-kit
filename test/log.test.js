const test = require('tape')
const { Oid, Repository } = require('nodegit')
const { resolve } = require('path')

const exec = require('./utils/exec.js')
const git = require('../')


test('log setup', t => {
  exec('sh ./log.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass(stdout)
    t.end()
  })
  .catch(t.end)
})

test('log', t => {
  const path = resolve(__dirname, './repos/log-git')

  git.open(path)
  .then(repo => {
    return git.log(repo, {
      sort: 'topological'
    })
    .then(history => {
      t.true(Array.isArray(history), 'history is an array')
      t.equal(history.length, 3, 'has 3 commits')
      t.equal(history.pop().message, 'first commit', 'last entry is first commit')
      t.end()
    })
  })
  .catch(t.end)
})

test('log --reverse', t => {
  const path = resolve(__dirname, './repos/log-git')

  git.open(path)
  .then(repo => {
    return git.log(repo, {
      sort: 'reverse'
    })
    .then(history => {
      t.true(Array.isArray(history), 'history is an array')
      t.equal(history.length, 3, 'has 3 commits')
      t.equal(history[0].message, 'first commit', 'starts with first commit')
      t.end()
    })
  })
  .catch(t.end)
})

test('log --abbrev-commit', t => {
  const path = resolve(__dirname, './repos/log-git')

  git.open(path)
  .then(repo => {
    return git.log(repo, {
      'abbrev-commit': true
    })
    .then(history => {
      t.equal(history.length, 3, 'has commits')
      t.true(history.every(entry => {
        return (entry.commit.length === 7)
      }), 'every id has length of 7')
    })
    .then(() => exec('git config --local core.abbrev 12', { cwd: path }))
    .then(() => git.log(repo, {
      'abbrev-commit': true
    }))
    .then(history => {
      t.true(history.every(entry => {
        return (entry.commit.length === 12)
      }), 'every id has length of 12')
    })
    .then(() => git.log(repo, {
      'abbrev': 11,
      'abbrev-commit': true
    }))
    .then(history => {
      t.true(history.every(entry => {
        return (entry.commit.length === 11)
      }), 'every id has length of 11')
      t.end()
    })
  })
  .catch(t.end)
})


test('log --max-count', t => {
  const path = resolve(__dirname, './repos/log-git')

  git.open(path)
  .then(repo => {
    return git.log(repo, {
      'max-count': 2
    })
    .then(history => {
      t.equal(history.length, 2, 'got 2 commits')
      t.end()
    })
  })
  .catch(t.end)
})

const test = require('tape')
const { Oid, Repository } = require('nodegit')
const { resolve } = require('path')

const exec = require('./utils/exec.js')
const git = require('../')

const path = resolve(__dirname, 'repos/diff-git')

test('diff setup', t => {
  exec('sh diff1.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass('sh diff1.sh')
    t.end()
  })
  .catch(t.end)
})

test('diff', t => {
  git.open(path, { init: false })
  .then(repo => {
    return Promise.all([
      git.diff(repo),
      exec('git diff', { cwd: path })
    ])
    .then(([changes, diff]) => {
      t.true(Array.isArray(changes), 'is array')
      t.equal(changes.length, 1, 'has 1 item')
      t.equal(changes[0].status, 'modified', 'is modified')
      t.equal(changes[0].path, 'file1.txt', 'is file1.txt')
      t.true(changes[0].size >= 20, 'size >= 20')
      t.true(changes[0].oldsize >= 16, 'oldsize >= 16')
      t.true(diff.includes(changes[0].hunks[0]), 'has hunk 1')
    })
  })
  .then(t.end)
  .catch(t.end)
})

test('diff change setup', t => {
  exec('sh diff2.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass('sh diff2.sh')
    t.end()
  })
  .catch(t.end)
})

test('diff modified index', t => {
  git.open(path, { init: false })
  .then(repo => {
    return Promise.all([
      git.diff(repo),
      exec('git diff', { cwd: path })
    ])
    .then(([changes, diff]) => {
      t.true(Array.isArray(changes), 'is array')
      t.equal(changes.length, 2, 'has 2 item')
      let i = 0
      for (const change of changes) {
        i++
        t.true('path' in change, `has path in change ${i}`)
        t.true('size' in change, `has size in change ${i}`)
        t.true('sha' in change, `has sha in change ${i}`)
        t.true('sha1' in change, `has sha1 in change ${i}`)
        t.true('status' in change, `has status in change ${i}`)
        t.true(change.hunks.length, `has ${change.hunks.length} hunks`)
        for (const hunk of change.hunks) {
          t.true(diff.includes(hunk), `has hunk in change ${i}`)
        }
      }
    })
  })
  .then(t.end)
  .catch(t.end)
})

test('diff commits', t => {
  Promise.all([
    git.open(path, { init: false }),
    exec('git rev-parse HEAD', { cwd: path }),
    exec('git rev-parse HEAD~1', { cwd: path }),
    exec('git rev-parse HEAD~2', { cwd: path }),
    exec('git rev-list --max-parents=0 HEAD', { cwd: path })
  ])
  .then(([repo, head, head1, head2, first]) => {
    return Promise.all([
      git.diff(repo, first.trim(), head2.trim()),
      exec(`git diff ${first} ${head2}`, { cwd: path })
    ])
    .then(([changes, diff]) => {
      t.true(diff.includes(changes[0].path), `has path ${changes[0].path}`)
      t.true(diff.includes(changes[0].hunks[0]), 'has hunk')
    })
    .then(() => Promise.all([
      git.diff(repo, head2.trim()),
      exec(`git diff ${head2}`, { cwd: path })
    ]))
    .then(([changes, diff]) => {
      t.true(diff.includes(changes[0].path), `has path ${changes[0].path}`)
      t.true(diff.includes(changes[1].path), `has path ${changes[1].path}`)
      // TODO: missing staged file3.txt
      t.true(diff.includes(changes[0].hunks[0]), 'has hunk')
      t.true(diff.includes(changes[1].hunks[0]), 'has hunk')
      t.true(diff.includes(changes[1].hunks[0]), 'has hunk')
    })
    .then(() => Promise.all([
      git.diff(repo, 'HEAD~1'),
      exec('git diff HEAD~1', { cwd: path })
    ]))
    .then(([changes, diff]) => {
      t.true(diff.includes(changes[0].hunks[0]), 'has hunk')
    })
    .then(() => Promise.all([
      git.diff(repo, first.trim(), head.trim()),
      git.diff(repo, first.slice(0, 10), head.slice(0, 10)),
      exec(`git diff ${first} ${head}`, { cwd: path })
    ]))
    .then(([changes, changes1, diff]) => {
      t.equal(changes[1].status, 'added', 'has added')
      t.equal(changes[1].path, 'file3.txt', 'has file3.txt')
      t.equal(changes[1].sha1, '0000000000000000000000000000000000000000')
      t.true(!('oldsize' in changes[1]), 'no oldsize')
      t.true(diff.includes(changes[1].hunks[0]), 'has hunk')
      t.deepEqual(changes, changes1)
    })
  })
  .then(t.end)
  .catch(t.end)
})

test('diff setup moves files', t => {
  exec('sh diff3.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass('sh diff3.sh')
    t.end()
  })
  .catch(t.end)
})

test('diff --name-only', t => {
    Promise.all([
      git.open(path, { init: false }),
      exec('git rev-parse HEAD', { cwd: path }),
      exec('git rev-parse HEAD~2', { cwd: path })
    ])
    .then(([repo, head, head4]) => {
      return git.diff(repo, head4.trim(), head.trim(), {
        'name-only': true
      })
    })
    .then((filenames) => {
      t.true(Array.isArray(filenames), 'is array')
      t.equal(filenames.length, 3, 'has 3 items')
      t.equal(filenames[2], 'file3.txt', '3rd item is file3.txt')
    })
    .then(t.end)
    .catch(t.end)
})

test('diff nothing', t => {
  git.open(path, { init: false })
  .then(repo => {
    return Promise.all([
      git.diff(repo),
      exec('git diff', { cwd: path })
    ])
    .then(([changes, diff]) => {
      t.true(Array.isArray(changes), 'is array')
      t.deepEqual(changes, [], 'has no item')
      t.false(diff, 'no diff')
    })
  })
  .then(t.end)
  .catch(t.end)
})

test('diff commits part II', t => {
  Promise.all([
    git.open(path, { init: false }),
    exec('git rev-parse HEAD', { cwd: path }),
    exec('git rev-parse HEAD~1', { cwd: path })
  ])
  .then(([repo, head, head1]) => {
    return Promise.all([
      git.diff(repo, head1.trim()),
      exec(`git diff ${head1}`, { cwd: path })
    ])
    .then(([changes, diff]) => {
      t.true(changes.some(change => {
        return change.path == 'file3.txt' && change.status == 'deleted'
      }), 'file3.txt got removed')
      // console.log(diff)
      // console.log(changes)
      // TODO: moved file2.txt to file4.txt
    })
    .then(() => Promise.all([
      git.diff(repo, head1.trim(), head.trim()),
      exec(`git diff ${head1} ${head}`, { cwd: path })
    ]))
    .then(([changes, diff]) => {
      // TODO: moved file2.txt to file4.txt
      // console.log(diff)
      // console.log(changes)
    })
  })
  .then(t.end)
  .catch(t.end)
})

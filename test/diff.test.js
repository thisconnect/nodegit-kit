const test = require('tape')
const { Oid, Repository } = require('nodegit')
const { resolve } = require('path')

const exec = require('./utils/exec.js')
const git = require('../')


test('diff setup', t => {
  exec('sh diff1.sh', { cwd: __dirname })
  .then(stdout => {
    t.pass('sh diff1.sh')
    t.end()
  })
  .catch(t.end)
})

test('diff', t => {
  const path = resolve(__dirname, 'repos/diff-git')

  git.open(path, { init: false })
  .then(repo => {
    return Promise.all([
      exec('git diff', { cwd: path }),
      git.diff(repo)
    ])
    .then(([diff, changes]) => {
      t.true(Array.isArray(changes), 'is array')
      t.equal(changes.length, 1, 'has 1 item')
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
  const path = resolve(__dirname, 'repos/diff-git')

  git.open(path, { init: false })
  .then(repo => {
    return Promise.all([
      exec('git diff', { cwd: path }),
      git.diff(repo)
    ])
    .then(([diff, changes]) => {
      t.true(Array.isArray(changes), 'is array')
      t.equal(changes.length, 2, 'has 2 item')
      let i = 0
      for (const change of changes) {
        i++
        t.true('path' in change, `has path in change ${i}`)
        t.true('size' in change, `has size in change ${i}`)
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

test('diff two commits', t => {
  const path = resolve(__dirname, 'repos/diff-git')

  Promise.all([
    git.open(path, { init: false }),
    exec('git rev-parse HEAD', { cwd: path }),
    exec('git rev-parse HEAD~1', { cwd: path }),
    exec('git rev-parse HEAD~2', { cwd: path }),
    exec('git rev-list --max-parents=0 HEAD', { cwd: path })
  ])
  .then(([repo, head, head1, head2, first]) => {
    // console.log('head', head)
    // console.log('head1', head1)
    // console.log('head2', head2)
    // console.log('first', first)
    return Promise.all([
      git.diff(repo, first.trim(), head2.trim()),
      exec(`git diff ${first} ${head2}`, { cwd: path })
    ])
    .then(([changes, diff]) => {
      // console.log(changes)
      // console.log(diff)
      t.true(diff.includes(changes[0].path), `has path ${changes[0].path}`)
      t.true(diff.includes(changes[0].hunks[0]), 'has hunk')
    })
    .then(() => Promise.all([
      git.diff(repo, head2.trim()),
      exec(`git diff ${head2}`, { cwd: path })
    ]))
    .then(([changes, diff]) => {
      console.log('==================================')
      console.log(changes)
      console.log('==================================')
      console.log(diff)
      console.log('==================================')
      t.true(diff.includes(changes[0].path), `has path ${changes[0].path}`)
      t.true(diff.includes(changes[0].hunks[0]), 'has hunk')
      t.true(diff.includes(changes[1].hunks[0]), 'has hunk')
      t.true(diff.includes(changes[1].hunks[1]), 'has hunk')
    })
    .then(() => Promise.all([
      git.diff(repo, 'HEAD~1'),
      exec(`git diff HEAD~1`, { cwd: path })
    ]))
    .then(([changes, diff]) => {
      // console.log(changes)
      // console.log(diff)
      t.true(diff.includes(changes[0].hunks[0]), 'has hunk')
    })
  })
  .then(t.end)
  .catch(t.end)
})


//
//
// var hunk1 = '@@ -1,7 +1,6 @@\n 1\n 2\n-3\n-4\n+3.1\n 5\n 6\n 7';
// var hunk2 = '@@ -22,7 +21,7 @@\n 22\n 23\n 24\n-25\n+52\n 26\n 27\n 28';
//
//
// test.serial('state get diff', function(t){
//     return git.open(dir)
//     .then(function(repo){
//         return git.diff(repo);
//     })
//     .then(function(changes){
//         t.truthy(Array.isArray(changes), 'changes is an Array');
//         changes.forEach(function(change){
//             t.truthy(change.path, 'has path');
//             t.truthy(change.size, 'has size');
//             t.truthy(change.status, 'has status');
//
//             if (change.status != 'modified') return;
//             t.is(change.size, 78, 'size is 78');
//             t.is(change.oldsize, 78, 'oldsize is 78');
//             t.truthy(Array.isArray(change.hunks), 'hunks is an Array');
//             t.truthy(change.hunks.length == 2, 'has 2 hunks');
//             t.is(change.hunks[0], hunk1, 'test hunk 1');
//             t.is(change.hunks[1], hunk2, 'test hunk 2');
//         });
//     });
// });

const test = require('tape')
const { resolve } = require('path')

const exec = require('./utils/exec.js')
const git = require('../')


// test('config setup', t => {
//   exec('sh ./config.sh', { cwd: __dirname })
//   .then(stdout => {
//     t.pass(stdout)
//     t.end()
//   })
//   .catch(t.end)
// })


test('config should throw lock error when running config.set in parallel', t => {
  const path = resolve(__dirname, './repos/config-lock-error')
  git.open(path)
  .then(repo => {
    return Promise.all([
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.name': 'test' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' }),
      git.config.set(repo, { 'user.email': 'test@localhost' })
    ])
  })
  .then(() => {
    t.pass('succeeded this time but expect lock error')
    t.end()
  })
  .catch(error => {
    t.true(error instanceof Error, 'is instance of Error')
    t.true(error.message.includes('failed to lock file'), 'failed to lock message')
    t.equal(error.errno, -14, 'errno -14')
    t.end()
  })
})

test('config get error', t => {
  git.open(resolve(__dirname, './repos/config-get'))
  .then(repo  => {
    git.config.get(repo, {}) // TODO: should this error?
    .then(config => {
      t.true(config == null, 'got no config')
      t.end()
    })
    .catch(t.end)
  })
})

test('config get and set repo configs', t => {
  const path = resolve(__dirname, './repos/config-test')

  git.init(path, {
    'commit': false
  })
  .then(repo => {
    return git.config.set(repo, {
      'user': {
        'name': 'user1',
        'email': 'user1@localhost'
      }
    })
    .then(() => git.init.commit(repo))
    // find user.name and user.email (git)
    .then(() => exec('git log', { cwd: path }))
    .then(stdout => {
      const author = 'Author: user1 <user1@localhost>'
      t.true(stdout.includes(author), `includes ${author}`)
    })
    // test user.email config
    .then(() => git.config.get(repo, 'user.email'))
    .then(email => t.equal(email, 'user1@localhost', 'get user.email from repo config'))
    // set user.name config and read it with git
    // TODO: .then(() => git.config.set(repo, 'user.name', 'user2'))
    .then(() => git.config.set(repo, {
      'user.name': 'John Doe'
    }))
    .then(() => exec('git config --local user.name', { cwd: path }))
    .then(stdout => t.equal(stdout, 'John Doe', 'set new username'))
    .then(() => exec('git config --local user.email', { cwd: path }))
    .then(stdout => t.equal(stdout, 'user1@localhost', 'email is still the same'))
    // read updated user.email
    .then(() => exec('git config user.email johndoe@example.com', { cwd: path }))
    .then(() => git.config.get(repo, 'user.email'))
    .then(email => t.equal(email, 'johndoe@example.com', 'got updated email'))
    .then(() => git.config.set(repo, {
      'user.name': 'Jane Doe',
      'core.abbrev': 11,
      'core.autocrlf': 'input'
    }))
    .then(() => git.config.get(repo, ['user.name', 'core.abbrev', 'core.autocrlf']))
    .then(([username, abbrev, autocrlf]) => {
      t.equal(username, 'Jane Doe', `user.name ${username}`)
      t.equal(abbrev, '11', `core.abbrev is ${abbrev}`)
      t.equal(typeof abbrev, 'string', `core.abbrev is a string :/`)
      t.equal(autocrlf, 'input', 'autocrlf should be set to input')
    })
    .then(() => exec('git config --local --list', { cwd: path }))
    .then(stdout => {
      t.pass('stdout from git config --local --list')
      t.true(stdout.includes('user.name=Jane Doe'), 'user.name=Jane Doe')
      t.true(stdout.includes('user.email=johndoe@example.com'), 'user.email=johndoe@example.com')
      t.true(stdout.includes('core.abbrev=11'), 'core.abbrev=11')
      t.true(stdout.includes('core.autocrlf=input'), 'core.autocrlf=input')
    })

  })
  .then(t.end)
  .catch(t.end)
})

test('config compare defaults to global config', t => {
  const path = resolve(__dirname, './repos/config-defaults')
  git.open(path)
  .then(repo => {
    return Promise.all([
      git.config.get(repo, ['user.name', 'user.email']),
      git.config.get(['user.name', 'user.email']),
      exec('git config --global user.name'),
      exec('git config --global user.email')
    ])
    .then(([
      [reponame, repoemail],
      [globalname, globalemail],
      gitname, gitemail
    ]) => {
      t.equal(reponame, globalname, 'should be same name')
      t.equal(reponame, gitname, 'should be same git name')
      t.equal(repoemail, globalemail, 'should be same email')
      t.equal(repoemail, gitemail, 'should be same git email')
      return [reponame, repoemail]
    })
    .then(([name, email]) => {
      return exec('git log', { cwd: path })
      .then(stdout => {
        const author = `Author: ${name} <${email}>`
        t.true(stdout.includes(author), 'git log includes author')
        t.pass(author)
      })
    })
  })
  .then(t.end)
  .catch(t.end)
})

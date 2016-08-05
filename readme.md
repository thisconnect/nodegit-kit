NodeGit-Kit
-----------

[![Build Status](https://img.shields.io/travis/thisconnect/nodegit-kit/master.svg?style=flat-square)](https://travis-ci.org/thisconnect/nodegit-kit)
[![Coverage Status](https://img.shields.io/coveralls/thisconnect/nodegit-kit/master.svg?style=flat-square)](https://coveralls.io/github/thisconnect/nodegit-kit?branch=master)
[![Dependencies](https://img.shields.io/david/thisconnect/nodegit-kit.svg?style=flat-square)](https://david-dm.org/thisconnect/nodegit-kit)
[![Dev Dependencies](https://img.shields.io/david/dev/thisconnect/nodegit-kit.svg?style=flat-square)](https://david-dm.org/thisconnect/nodegit-kit#info=devDependencies)
[![MIT](https://img.shields.io/npm/l/nodegit-kit.svg?style=flat-square)](https://github.com/thisconnect/nodegit-kit/blob/master/license)
[![NPM Version](https://img.shields.io/npm/v/nodegit-kit.svg?style=flat-square)](https://www.npmjs.com/package/nodegit-kit)

Promises for git commands such as `git init`,
`git status`, `git add *`, `git diff`, `git log` and `git commit -am"commit message"`.

Comments are welcome at [nodegit-kit/issues](https://github.com/thisconnect/nodegit-kit/issues)

### Install

```bash
npm i --save nodegit-kit
```


### Usage

```javascript
var git = require('nodegit-kit');

git.open('../repo-path/new/or/existing')
.then(function(repo){

     // git diff
    return git.diff(repo)
    .then(function(diff){
        console.log(diff);

        // git commit -am"commit message"
        return git.commit(repo, {
            'message': 'commit message'
        });
    })
    .then(function(){
        // git log
        return git.log(repo);
    })
    .then(function(log){
        console.log(log);
    });
})
.catch(function(error){
    console.error(error);
});
```


## API

- [open](#open-path-options)
- [commit](#commit-repo-options)
- [status](#status-repo)
- [log](#log-repo-options)
- [diff](#diff-repo-commit-commit)
- [config](#config)
- [init](#init-path-options)
- [init.commit](#init.commit-repo-options)


### open (path[, options])

Returns repository, if no repo is found, tries to create the directory
and initializes the repository.
Initializing is using [init](#init-path-options) internally.

- `path` String
- `options` Object
  - `init` Boolean whether to create a first commit, defaults to true

```javascript
git.open('../repo-path/new/or/existing', {
    'init': false
})
.then(function(repo){
    // NodeGit repository instance
})
.catch(function(){
    // no repo here
});
```


### commit (repo[, options])

Checks if status has pending changes, commits, returns Oid else returns null.

- `repo` NodeGit repository instance
- `options`
  - `message` String defaults to 'update'

```javascript
git.open('../repo-path/new/or/existing')
.then(function(repo){
    // git commit -am"a new commit"
    return git.commit(repo, {
        'message': 'a new commit'
    })
    .then(function(oid){
        console.log(oid);
    });
});
```


### status (repo)

Returns an Array of changed files and their status.

- `repo` NodeGit repository instance

```javascript
git.open('../repo-path/new/or/existing')
.then(function(repo){
    // git status
    return git.status(repo)
    .then(function(status){
        console.log(status);
    });
});
```


### log (repo[, options])

Returns an Array of all commits.

- `repo` NodeGit repository instance
- `options`
  - `sort` String can be 'none', 'topological', 'time' or 'reverse'
  - `abbrev-commit` Boolean if true shortens checksum, defaults to false
  - `abbrev` Number to specify a custom number of digits in combination with `abbrev-commit`, otherwise uses 'core.abbrev' config

```javascript
git.open('../repo-path/new/or/existing')
.then(function(repo){
    // git log
    return git.log(repo)
    .then(function(log){
        console.log(log);
    });
});
```


### diff (repo[, commit[, commit]])

Returns an Array of modified files and their diffs.

- `repo` NodeGit repository instance

```javascript
git.open('../repo-path/new/or/existing')
.then(function(repo){
    // git diff
    return git.diff(repo)
    .then(function(diff){
        console.log(diff);
    });
});
```


#### Get a diff of a commit

```javascript
git.open('../repo-path/new/or/existing')
.then(function(repo){
    return git.log(repo)
    .then(function(history){
        return history[0].commit;
    })
    .then(function(commit){
        // git diff <commit>
        return git.diff(repo, commit);
    })
    .then(function(diff){
        console.log(diff);
    });
});
```


#### Get a diff between 2 commits

**Breaking API change in 0.12.0**
Changed order of `from` and `to` to be aligned with git-cli.

```javascript
git.open('../repo-path/new/or/existing')
.then(function(repo){
    return git.log(repo, { sort: 'reverse' })
    .then(function(history){
        var commit1 = history[0].commit;
        var commit2 = history[2].commit;
        // git diff <from> <to>
        return git.diff(repo, commit1, commit2);
    })
    .then(function(diff){
        console.log(diff);
    });
});
```


### config

Allows to write/read global and local git config values.
Local values are stored in the Git directory `./git/config` and overrule global configurations.
Note: Git locks the config when changing configurations,
therefore writing multiple configs can not be done in parallel.
e.g. Promise.all multiple individual `git.config.set` calls
will throw a "Failed to lock file for writing" error,
[nodegit/issues/757](https://github.com/nodegit/nodegit/issues/757).


See also [8.1 Customizing Git - Git Configuration](http://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration) (Git SCM Documentation)


#### config.set (repo, options)

##### Example setting user.name and user.email for a specific repository

Set user name and email similar to `cd repo` then
`git config user.name "John Doe"` and  `git config user.email johndoe@example.com`.

```javascript
git.open('my/repository')
.then(function(repo){
    return git.config.set(repo, {
        'user.name': 'John Doe',
        'user.email': 'johndoe@example.com'
    });
});
```


#### config.get (repo, options)

##### Example reading user.name and user.email

Similar to `cd repo` then`git config user.name` returns config for a repository if there any or else the global Git configuration.

```javascript
git.open('my/repository')
.then(function(repo){
    return git.config.get(repo, ['user.name', 'user.email']);
})
.then(function(configs){
    // [ 'John Doe', 'johndoe@example.com' ]
});
```

### global git configuration

#### config.get (options)

When no repo is given, setting and getting config will operate in `--global` mode and read and write to `~/.gitconfig` (or `~/.config/git/config`).

```javascript
git.config.get(['user.name', 'user.email'])
.then(function(config){
    // [ 'John Doe', 'johndoe@example.com' ]
});
```

#### config.set (options)

```javascript
// WARNING: this will change your global git config
git.config.set({
    'user.name': 'John Doe',
    'user.email': 'johndoe@example.com'
});
```


### init (path[, options])

Ensures directory exists, initializes, creates a first commit and returns repo.
This is optional and only useful to control the first commit.

- `path` String
- `options` Object
  - `bare` Number defaults to 0
  - `commit` Boolean defaults to true
  - `message` String defaults to 'initial commit'

```javascript
git.init('../repo-path/new/or/existing', {
    'bare': 0,
    'commit': true,
    'message': 'my first commit'
})
.then(function(repo){
    // NodeGit repository instance
});
```


### init.commit (repo[, options])

Can be used to in combination with suppressing commit on init.


- `repo` NodeGit Repository instance
- `options`
  - `message` String defaults to 'initial commit'


```javascript
git.open('../path/to/repo', {
    'init': false
})
.catch(function(){
    return git.init('../path/to/repo', {
        'commit': false
    })
    .then(function(repo){
        // do something before first commit
        return repo;
    })
    .then(function(repo){
        git.init.commit(repo, {
            'message': 'initialize repository'
        });
    });
})
.then(function(repo){
    // NodeGit repository instance
});
```


## Test

```bash
npm install

npm test

# debug nodegit-kit
DEBUG=kit* npm test

# debug all
DEBUG=* npm test
```

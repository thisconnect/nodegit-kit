NodeGit-Kit
-----------

[![Build Status](https://img.shields.io/travis/thisconnect/nodegit-kit/master.svg?style=flat-square)](https://travis-ci.org/thisconnect/nodegit-kit)
[![Dependencies](https://img.shields.io/david/thisconnect/nodegit-kit.svg?style=flat-square)](https://david-dm.org/thisconnect/nodegit-kit)
[![Dev Dependencies](https://img.shields.io/david/dev/thisconnect/nodegit-kit.svg?style=flat-square)](https://david-dm.org/thisconnect/nodegit-kit#info=devDependencies)

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


### git status

```javascript
git.open('../repo-path/new/or/existing')
.then(function(repo){
    // git status
    return git.status(repo);
})
.then(function(status){
    console.log(status);
});
```


### git config

Allows to write/read global and local values.
Local values are stored in the Git directory `./git/config` and overrule global configurations.
Git locks the config when changing configurations,
therefore modifications can not be done in parallel,
e.g. Promise.all multiple individual `git.config.set` calls
will throw a failed to lock file for writing error.


See also [8.1 Customizing Git - Git Configuration](http://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration) (Git SCM Documentation)


#### Example set name and email for a specific repository

Setting user name and email similar to
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

#### Example reading user.name and user.email

Similar to `git config user.name` returns config for a repository if there any or else the global Git configuration.

```javascript
git.open('my/repository')
.then(function(repo){
    return git.config.get(repo, ['user.name', 'user.email']);
})
.then(function(configs){
    // [ 'John Doe', 'johndoe@example.com' ]
});
```


#### Example working with global Git configuration

When no repo is given setting and getting config will operate in `--global` mode and read and write to `~/.gitconfig` (or `~/.config/git/config`).

```javascript
git.config.get(['user.name', 'user.email'])
.then(function(config){
    // [ 'John Doe', 'johndoe@example.com' ]
});
```


```javascript
// warning this will change your global git config
git.config.set({
    'user.name': 'John Doe',
    'user.email': 'johndoe@example.com'
});
```


### Test

```bash
npm install

npm test

# debug nodegit-kit
DEBUG=kit* npm test

# debug all
DEBUG=* npm test
```

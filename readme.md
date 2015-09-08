NodeGit-Kit
-----------

An incomplete set of NodeGit helper promises. Please don't use this in production yet.

Comments are welcome: https://github.com/thisconnect/nodegit-kit/issues

```javascript
var git = require('nodegit-kit');

git.open('../repo-path/new/or/existing')
.then(function(repo){
    return repo;
})
.then(function(repo){
     // git diff
    return git.diff(repo)
    .then(function(diff){
        // console.log(diff);
        return repo;
    });
})
.then(function(repo){
    // git commit -am"commit message"
    return git.commit(repo, {
        'message': 'commit message'
    });
})
.then(function(repo){
    // git log
    return git.log(repo);
})
.then(function(log){
    // console.log(log);
})
.catch(function(error){
    console.error(error.stack);
});
```

### git status

```javascript
git.open('../repo-path/new/or/existing')
.then(function(repo){
     // git status
    return git.status(repo)
    .then(function(status){
       console.log(status);
       return repo;
    })
})
```

### git config

This is optional, if not configured, config tries to read your global git config.

```javascript
git.config.set({
    'user': {
        'name': 'username',
        'email': 'user@localhost'
    }
});
```

## Example

```bash
npm test
```

![NodeGit-Kit example log](https://raw.github.com/thisconnect/nodegit-kit/master/log.png)

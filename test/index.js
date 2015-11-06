'use strict';

var git = require('../');

git.config.set({
    'user': {
        'name': 'username',
        'email': 'user@localhost'
    }
});

git.open('./test/repos/all') // returns repo
.then(function(repo){
    return repo;
})
/*
.then(function(repo){
     // git status
    return git.status(repo)
    .then(function(statuses){
       // console.log(statuses);
       return repo;
    })
})
*/
.then(function(repo){
    return git.diff(repo)
    .then(function(diff){
        // console.log(diff);
        return repo;
    });
})
.then(function(repo){
    // git commit -am""
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

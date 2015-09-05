'use strict';

var debug = require('debug')('test');

var kit = require('../');

var open = kit.open;
var config = kit.config;
var commit = kit.commit;
var diff = kit.diff;
var log = kit.log;
var status = kit.status;

config.set({
    'user': {
        'name': 'username',
        'email': 'user@localhost'
    }
});

open('test/repo') // returns repo
.then(function(repo){
    return repo;
})
/*
.then(function(repo){
     // git status
    return status(repo)
    .then(function(statuses){
       // console.log(statuses);
       return repo;
    })
})
*/
.then(function(repo){
    return diff(repo)
    .then(function(diff){
        // console.log(diff);
        return repo;
    });
})
.then(function(repo){
    // git commit -am""
    return commit(repo, {
        'message': 'commit message'
    });
})
.then(function(repo){
    // git log
    return log(repo);
})
.then(function(log){
    // console.log(log);
})
.catch(function(error){
    console.error(error.stack);
});

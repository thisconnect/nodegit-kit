'use strict';

var Git = require('nodegit');
var path = require('path');
var debug = require('debug')('commit');

var add = require('./add');
var config = require('./config');
var status = require('./status');

module.exports = function(repo){

    return status(repo)
    .then(function(status){
        if (!status.length) throw 'nothing to commit';
    })
    .then(function(){
        return add(repo);
    })
    .then(function(oid){
        return Promise.all([
            repo.getTree(oid),
            repo.getBranchCommit('master'),
            config.getSignature()
        ]);
    })
    .then(function(result){
        return {
            'tree': result[0],
            'commit': result[1],
            'author': result[2],
            'committer': result[2],
            'message': 'snapshot'
        };
    })
    .then(function(data){
        debug('parent %s', data.commit.id());
        return repo.createCommit('HEAD',
            data.author,
            data.committer,
            data.message,
            data.tree,
            [data.commit.id()]
        );
    })
    .then(function(oid){
        debug('new %s', oid);
        return repo;
    })
    .catch(function(error){
        debug(error);
        return repo;
    });

};

'use strict';

var Git = require('nodegit');
var files = require('fildes');
var debug = require('debug')('kit:init');

var add = require('./add');
var config = require('./config');

module.exports = function(dir, o){
    o = o || {};
    var option = {
        'bare': o.bare || 0,
        'message': o.message || 'initial commit'
    };

    return files.mkdir(dir)
    .then(function(){
        debug('repo %s', dir);
        return Git.Repository.init(dir, option.bare);
    })
    .then(function(repo){
        if (option.bare){
            return repo;
        }

        return Promise.all([
            add(repo),
            config.getSignature()
        ])
        .then(function(result){
            return {
                'oid': result[0],
                'author': result[1],
                'committer': result[1],
                'message': option.message
            };
        })
        .then(function(data){
            return repo.createCommit('HEAD',
                data.author,
                data.committer,
                data.message,
                data.oid,
                []
            );
        })
        .then(function(){
            return repo.getBranchCommit('master');
        })
        .then(function(commit){
            return commit.id();
        })
        .then(function(oid){
            debug('first commit %s', oid);
            return repo;
        });

    });

};

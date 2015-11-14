'use strict';

var Git = require('nodegit');
var files = require('fildes');
var debug = require('debug')('kit:init');

var add = require('./add');
var config = require('./config');

function commit(repo, option){
    option = option || {};

    return Promise.all([
        add(repo),
        config.getSignature(repo)
    ])
    .then(function(result){
        return {
            'oid': result[0],
            'author': result[1],
            'committer': result[1],
            'message': option.message || 'initial commit'
        };
    })
    .then(function(data){
        debug('create first commit');
        return repo.createCommit('HEAD',
            data.author,
            data.committer,
            data.message,
            data.oid,
            []
        );
    });
}

module.exports = function(dir, o){
    o = o || {};
    var option = {
        'bare': o.bare || 0,
        'commit': o.commit != null ? o.commit : true,
        'message': o.message || 'initial commit'
    };

    return files.mkdir(dir)
    .then(function(){
        debug('repo init %s', dir);
        return Git.Repository.init(dir, option.bare);
    })
    .then(function(repo){
        if (option.bare || option.commit === false){
            return repo;
        }
        return commit(repo, option)
        .then(function(oid){
            return repo;
        });
    });

};

module.exports.commit = commit;

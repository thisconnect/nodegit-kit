'use strict';

var Git = require('nodegit');
var path = require('path');
var mkdirp = require('mkdirp');
var debug = require('debug')('init');

var add = require('./add');
var config = require('./config');

module.exports = function(o){

    var option = {
        'bare': o.bare || 0,
        'path': o.path,
        'dir': path.resolve(o.path)
    };

    return new Promise(function(resolve, reject){
        mkdirp(option.dir, function(error){
            if (!!error) return reject(error);
            resolve();
        });
    })
    .then(function(){
        debug('repo %s', option.path);
        return Git.Repository.init(option.dir, option.bare);
    })
    .then(function(repo){

        return Promise.all([
            add(repo),
            config.getSignature()
        ])
        .then(function(result){
            return {
                'oid': result[0],
                'author': result[1],
                'committer': result[1],
                'message': 'setup'
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
        .then(function(oid){
            debug('first commit %s', oid);
            return repo;
        });

    })
    .catch(function(error){
        debug(error);
    });

};

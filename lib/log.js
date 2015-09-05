'use strict';

var Git = require('nodegit');
var debug = require('debug')('log');

module.exports = function(repo){

    return repo.getBranchCommit('master')
    .then(function(commit){
        return new Promise(function(resolve, reject){

            var history = [];
            commit.history(Git.Revwalk.SORT.Time)
            .on('commit', function(commit){
                var author = commit.author();
                history.push({
                    'commit': commit.sha(),
                    'author': {
                        'name': author.name(),
                        'email': author.email()
                    },
                    'date': commit.date(),
                    'message': commit.message().trim()
                });
            })
            .on('end', function(commits){
                debug('commits %d', history.length);
                resolve(history);
            })
            .on('error', function(error){
                reject(error);
            })
            .start();
        })
        .catch(function(error){
            console.error(error.stack);
        });

    });

};

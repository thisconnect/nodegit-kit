'use strict';

var Git = require('nodegit');

var order = {
    'none': Git.Revwalk.SORT.NONE,
    'topological': Git.Revwalk.SORT.TOPOLOGICAL,
    'time': Git.Revwalk.SORT.TIME,
    'reverse': Git.Revwalk.SORT.REVERSE
};

module.exports = function(repo, o){
    o = o || {};

    var options = {
        'sort': o.sort in order ? order[o.sort] : o.sort
    };

    return repo.getBranchCommit('master')
    .then(function(commit){
        return new Promise(function(resolve, reject){

            commit.history(options.sort)
            .on('end', function(commits){
                var history = commits.map(function(commit){
                    var author = commit.author();
                    return {
                        'commit': commit.sha(),
                        'author': {
                            'name': author.name(),
                            'email': author.email()
                        },
                        'date': commit.date(),
                        'message': commit.message().trim()
                    };
                });
                resolve(history);
            })
            .on('error', function(err){
                reject(err);
            })
            .start();
        });
    });
};
/*
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
})*/

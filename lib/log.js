'use strict';

var Git = require('nodegit');
var debug = require('debug')('kit:log');

var config = require('./config');

var order = {
    'none': Git.Revwalk.SORT.NONE,
    'topological': Git.Revwalk.SORT.TOPOLOGICAL,
    'time': Git.Revwalk.SORT.TIME,
    'reverse': Git.Revwalk.SORT.REVERSE
};

var map = function(repo, o){
    var abbrev = !!o['abbrev-commit'];

    return Promise.resolve()
    .then(function(){
        if (!abbrev || !!o.abbrev) return o;

        return config.get(repo, 'core.abbrev')
        .then(function(abbrev){
            o.abbrev = abbrev; // immutable!?
            return o;
        });
    })
    .then(function(options){
        return function(commit){
            var author = commit.author();
            var sha = commit.sha();
            if (abbrev){
                sha = sha.slice(0, options.abbrev);
            }

            return {
                'commit': sha,
                'author': {
                    'name': author.name(),
                    'email': author.email()
                },
                'date': commit.date(),
                'message': commit.message().trim()
            };
        };
    });
};

// repo.createRevWalk();
// revwalk.sorting(NodeGit.Revwalk.SORT.TIME);
// revwalk.getCommits(1);

module.exports = function(repo, o){
    o = o || {};

    var options = {
        'sort': o.sort in order ? order[o.sort] : o.sort,
        'abbrev': o.abbrev || null,
        'abbrev-commit': o['abbrev-commit'] || false
    };

    return repo.getBranchCommit('master')
    .then(function(commit){
        return new Promise(function(resolve, reject){
            commit.history(options.sort)
            .on('end', resolve)
            .on('error', reject)
            .start();
        })
        .then(function(commits){
            return map(repo, options)
            .then(function(log){
                return commits.map(log);
            });
        });
    });
};

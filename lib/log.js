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
        if (!abbrev) return o;
        if (!!o.abbrev) return o;

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
}

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
        /*
        .then(function(commits){
            if (!options['abbrev-commit']){
                return commits;
            }

            var oid = commits[0].id();

            return Git.Object.lookup(repo, oid, Git.Object.TYPE.COMMIT)
            .then(function(object){
                return object.shortId();
            })
            .then(function(buf){
                console.log('buffer', buf);
                // Use buf
                return commits;
            });

        })*/
        /*
        .then(function(commits){
            return commits.map(function(commit){

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
        });
        */
    });
};

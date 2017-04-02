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


module.exports = function(repo, o){
    o = o || {};

    var options = {
        'sort': o.sort in order ? order[o.sort] : o.sort,
        'abbrev': o.abbrev || null,
        'abbrev-commit': o['abbrev-commit'] || false,
        'max-count': Infinity // TODO: document
    };

    return repo.getBranchCommit(o.branch || 'master')
    .then(function(commit){
        var walker = repo.createRevWalk();
        walker.push(commit.id());
        walker.sorting(options.sort);
        return walker.getCommits(options['max-count']);
    })
    .then(function(history){
        return new Promise(function(resolve, reject){
            if (!options['abbrev-commit']){
                return resolve();
            }
            if (options.abbrev){
                return resolve(options.abbrev);
            }
            return config.get(repo, 'core.abbrev')
            .catch(function(e){
                return 7;
            })
            .then(resolve);
        })
        .then(function(abbrev){
            return history.map(function(commit){
                var author = commit.author();
                var sha = commit.sha();
                if (abbrev){
                    sha = sha.slice(0, abbrev);
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
            });
        });
    });

};

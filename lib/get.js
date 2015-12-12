'use strict';

var Git = require('nodegit');
var debug = require('debug')('kit:get');


module.exports = function(repo, o){
    o = o || {};
    if (o == null){
        return repo.getBranchCommit('master');
    }
    if (o instanceof Git.Commit){
        return Promise.resolve(o);
    }
    if (o instanceof Git.Oid){
        return repo.getCommit(o);
    }

    return Promise.resolve({
        'branch': o.branch || 'master',
        'commit': o.commit || o
    })
    .then(function(option){
        if (typeof option.commit != 'string'){
            return repo.getBranchCommit(option.branch);
        }
        if (option.commit.length == 40){
            return repo.getCommit(o);
        }
        return Git.AnnotatedCommit.fromRevspec(repo, option.commit)
        .then(function(annotatedCommit){
            return annotatedCommit.id();
        })
        .then(function(id){
            return repo.getCommit(id);
        });
    });

};

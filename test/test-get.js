var git = require('../');
var get = require('../lib/get.js');

var test = require('ava');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir = resolve(__dirname, 'repos/get');
var file = resolve(dir, 'file.txt');


test.serial('get setup', function(t){
    return files.rmdir(dir)
    .then(function(){
        return files.write(file, '1\n');
    })
    .then(function(){
        return git.open(dir);
    })
    .then(function(repo){
        return files.appendFile(file, '2\n')
        .then(function(){
            return git.commit(repo);
        })
        .then(function(){
            return files.appendFile(file, '3\n');
        })
        .then(function(){
            return git.commit(repo);
        })
        .then(function(){
            return files.appendFile(file, '4\n');
        })
        .then(function(){
            return git.commit(repo, {
                message: 'last commit'
            });
        });
    })
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});

test.serial('get test', function(t){

    return git.open(dir)
    .then(function(repo){
        return repo.getBranchCommit('master')
        .then(function(commit){
            return new Promise(function(resolve, reject){
                commit.history()
                .on('end', resolve)
                .on('error', reject)
                .start();
            });
        })
        .then(function(commits){
            return Promise.all(commits.map(function(commit){
                return commit.sha();
            }));
        })
        .then(function(commits){
            return get(repo)
            .then(function(commit){
                t.is(commit.sha(), commits[0], 'got last commit');
            })
            .then(function(){
                return get(repo, commits[3])
                .then(function(commit){
                    t.is(commit.sha(), commits[3], 'got first commit');
                });
            })
            .then(function(){
                return get(repo, commits[1].slice(0, 7))
                .then(function(commit){
                    t.is(commit.sha(), commits[1], 'got abbrev commit');
                });
            })
            .then(function(){
                return get(repo, 'HEAD~2')
                .then(function(commit){
                    t.is(commit.sha(), commits[2], 'got second last commit');
                });
            });
        });
    })
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});

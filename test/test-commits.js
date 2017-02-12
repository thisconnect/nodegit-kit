var git = require('../');

var test = require('ava');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir = resolve(__dirname, 'repos/commits');


test.serial('commit setup', function(t){
    return files.rmdir(dir)
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});


test.serial('commit three times', function(t){
    var filepath = resolve(dir, 'test.txt');

    return git.open(dir)
    .then(function(repo){
        return files.writeFile(filepath, 'test\n')
        .then(function(){
            return git.commit(repo, {
                'message': 'test commit'
            });
        })
        .then(function(oid){
            t.truthy(oid, 'has oid');
            t.truthy(oid.toString().length == 40, 'oid has 40 bytes');
            return files.writeFile(filepath, 'test2\n');
        })
        .then(function(){
            return git.commit(repo, {
                'message': 'second commit'
            });
        })
        .then(function(oid){
            return files.writeFile(filepath, 'test3\n');
        })
        .then(function(){
            return git.commit(repo);
        });
    })
    .then(function(oid){
        t.pass('commited file');
    })
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});


test.serial('commit log', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.log(repo, {
            sort: 'topological'
        })
        .then(function(history){
            t.truthy(Array.isArray(history), 'has history');
            t.is(history.length, 4, 'has 4 commits');
            t.is(history.pop().message, 'initial commit', 'last entry is initial commit');
        });
    })
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});


test.serial('commit nothing', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.commit(repo)
        .then(function(){
            return git.log(repo);
        })
        .then(function(history){
            t.truthy(Array.isArray(history), 'has history');
            t.is(history.length, 4, 'still 4 commits');
        });
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});


test.serial('commit test log --abbrev-commit', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.log(repo, {
            'abbrev-commit': true
        })
        .catch(function(error){
            t.truthy(error instanceof Error, 'has Error');
            var msg = 'Config value \'core.abbrev\' was not found';
            t.is(error.message, msg, msg);
        })
        .then(function(){
            return git.log(repo, {
                'abbrev': 6,
                'abbrev-commit': true
            });
        })
        .then(function(history){
            t.truthy(history.length > 3, 'has commits');
            t.truthy(history.every(function(entry){
                return entry.commit.length == 6;
            }), 'every id has length of 6');
        })
        .then(function(){
            return git.config.set(repo, {
                'core.abbrev': 9
            });
        })
        .then(function(){
            return git.log(repo, {
                'abbrev-commit': true
            });
        })
        .then(function(history){
            t.truthy(history.length > 3, 'has commits');
            t.truthy(history.every(function(entry){
                return entry.commit.length == 9;
            }), 'every id has length of 9');
        });
    })
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});

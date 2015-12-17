var git = require('../');

var tape = require('tape');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir = resolve(__dirname, 'repos/commits');


tape('commit setup', function(t){
    files.rmdir(dir)
    .then(function(){
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});


tape('commit three times', function(t){
    var filepath = resolve(dir, 'test.txt');

    git.open(dir)
    .then(function(repo){
        return files.writeFile(filepath, 'test\n')
        .then(function(){
            return git.commit(repo, {
                'message': 'test commit'
            });
        })
        .then(function(oid){
            t.ok(oid, 'has oid');
            t.ok(oid.toString().length == 40, 'oid has 40 bytes');
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
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('log commits', function(t){
    git.open(dir)
    .then(function(repo){
        return git.log(repo, {
            sort: 'time'
        })
        .then(function(history){
            t.ok(Array.isArray(history), 'has history');
            t.equal(history.length, 4, 'has 4 commits');
            t.equal(history.pop().message, 'initial commit', 'last entry is initial commit');
            t.end();
        });
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('commit nothing', function(t){
    git.open(dir)
    .then(function(repo){
        return git.commit(repo)
        .then(function(){
            return git.log(repo);
        })
        .then(function(history){
            t.ok(Array.isArray(history), 'has history');
            t.equal(history.length, 4, 'still 4 commits');
            t.end();
        });
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('log --abbrev-commit', function(t){
    git.open(dir)
    .then(function(repo){
        return git.log(repo, {
            'abbrev-commit': true
        })
        .catch(function(error){
            t.ok(error instanceof Error, 'has Error');
            var msg = 'Config value \'core.abbrev\' was not found';
            t.equal(error.message, msg, msg);
        })
        .then(function(){
            return git.log(repo, {
                'abbrev': 6,
                'abbrev-commit': true
            });
        })
        .then(function(history){
            t.ok(history.length > 3, 'has commits');
            t.ok(history.every(function(entry){
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
            t.ok(history.length > 3, 'has commits');
            t.ok(history.every(function(entry){
                return entry.commit.length == 9;
            }), 'every id has length of 9');
        });
    })
    .then(function(){
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});















/**/

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

/*
tape('log diff', function(t){
    git.open(dir)
    .then(function(repo){
        return git.log(repo)
        .then(function(history){
            return history.map(function(log){
                return log.commit;
            });
        })
        .then(function(commits){
            console.log(commits);

            return git.diff(repo)
        })
        .then(function(changes){
            t.ok(Array.isArray(changes), 'changes is an Array');
            changes.forEach(function(change){
                t.ok(change.path, 'has path');
                t.ok(change.size, 'has size');
                t.ok(change.status, 'has status');
                if (change.status == 'modified'){
                    t.ok(change.oldsize, 'has old size');
                    t.ok(Array.isArray(change.hunks), 'hunks is an Array');
                    t.ok(change.hunks.length > 0, 'has at least 1 diff');
                }
            });
            return repo;
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
*/


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

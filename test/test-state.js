var git = require('../');

var tape = require('tape');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir = resolve(__dirname, './repos/state');
var file1 = resolve(dir, 'file1.txt');
var file2 = resolve(dir, 'file2.txt');
var file3 = resolve(dir, 'file3.txt');


var data1 = 'a\nb\nc\nd\n';
var data2 = '1\n2\n3\n4\n5\n6\n7\n8\n9\n'
    + '10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n'
    + '20\n21\n22\n23\n24\n25\n26\n27\n28\n29\n';
var data3 = 'foo\nbar\n';


tape('state setup', function(t){
    files.rmdir(dir)
    .then(function(){
        return Promise.all([
            files.write(file1, data1),
            files.write(file2, data2)
        ]);
    })
    .then(function(){
        return git.init(dir);
    })
    .then(function(){
        return Promise.all([
            files.write(file2, '3.1', {
                position: 4
            }),
            files.write(file2, '52', {
                position: 63
            }),
            files.writeFile(file3, data3)
        ]);
    })
    .then(function(){
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});


tape('status', function(t){
    git.open(dir)
    .then(function(repo){
        return git.status(repo);
    })
    .then(function(status){
        t.ok(status && status.length, 'got status');
        t.equal(status.length, 2, 'got two items');

        t.ok(status.some(function(file){
            return file.status == 'modified' && file.path == 'file2.txt';
        }), 'file2.txt is modified');

        t.ok(status.some(function(file){
            return file.status == 'new' && file.path == 'file3.txt';
        }), 'file3.txt is new');
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});


var hunk1 = '@@ -1,7 +1,6 @@\n 1\n 2\n-3\n-4\n+3.1\n 5\n 6\n 7';
var hunk2 = '@@ -22,7 +21,7 @@\n 22\n 23\n 24\n-25\n+52\n 26\n 27\n 28';


tape('diff', function(t){
    git.open(dir)
    .then(function(repo){
        return git.diff(repo);
    })
    .then(function(changes){
        t.ok(Array.isArray(changes), 'changes is an Array');
        changes.forEach(function(change){
            t.ok(change.path, 'has path');
            t.ok(change.size, 'has size');
            t.ok(change.status, 'has status');

            if (change.status != 'modified') return;
            t.equal(change.size, 78, 'size is 78');
            t.equal(change.oldsize, 78, 'oldsize is 78');
            t.ok(Array.isArray(change.hunks), 'hunks is an Array');
            t.ok(change.hunks.length == 2, 'has 2 hunks');
            t.equal(change.hunks[0], hunk1, 'test hunk 1');
            t.equal(change.hunks[1], hunk2, 'test hunk 2');
        });
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});


tape('commit changes', function(t){
    git.open(dir)
    .then(function(repo){
        return git.commit(repo)
        .then(function(){
            return files.appendFile(file1, 'e\nf\n');
        })
        .then(function(){
            return git.commit(repo, {message: 'appends to file1'});
        })
        .then(function(){
            return files.appendFile(file1, 'g\nh\n');
        })
        .then(function(){
            return git.commit(repo, {message: 'appends to file1'});
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


tape('diff commit', function(t){
    git.open(dir)
    .then(function(repo){
        return git.log(repo)
        .then(function(history){
            return history.map(function(log){
                return log.commit;
            });
        })
        .then(function(commits){
            return git.diff(repo, commits[1])
            .then(function(changes){
                var hunk = '@@ -4,3 +4,5 @@ c\n d\n e\n f\n+g\n+h';
                t.ok(Array.isArray(changes), 'changes is an Array');
                t.equal(changes.length, 1, 'has 1 change');
                t.equal(changes[0].status, 'modified', 'status is modified');
                t.equal(changes[0].size, 16, 'size is 16');
                t.equal(changes[0].oldsize, 12, 'oldsize is 12');
                t.equal(changes[0].hunks[0], hunk, 'test hunk');
            })
            .then(function(){
                var from = commits[0].slice(0, 10);
                var to = commits[2].slice(0, 10);
                return git.diff(repo, from, to);
            })
            .then(function(changes){
                var hunk = '@@ -2,3 +2,7 @@ a\n b\n c\n d\n+e\n+f\n+g\n+h';
                t.equal(changes.length, 1, 'has 1 diff (2 commits same file)');
                t.equal(changes[0].size, 16, 'size is 16');
                t.equal(changes[0].oldsize, 8, 'oldsize is 8');
                t.equal(changes[0].hunks[0], hunk, 'test hunk');
            })
            .then(function(){
                return git.diff(repo, commits[0], commits[3]);
            });
        });
    })
    .then(function(changes){
        changes.forEach(function(change){

            t.ok(change.path, change.path);
            t.ok(change.status, 'has status');
            if (change.path == 'file1.txt'){
                t.equal(change.status, 'modified', 'status is modified');
                t.equal(change.size, 16, 'size is 16');
                t.equal(change.oldsize, 8, 'oldsize is 8');
                t.equal(change.hunks[0], '@@ -2,3 +2,7 @@ a\n b\n c\n d\n+e\n+f\n+g\n+h', 'test hunk');

            }
            if (change.path == 'file2.txt'){
                t.equal(change.status, 'modified', 'status is modified');
                t.equal(change.size, 78, 'size is 78');
                t.equal(change.oldsize, 78, 'oldsize is 78');
                t.equal(change.hunks[0], '@@ -1,7 +1,6 @@\n 1\n 2\n-3\n-4\n+3.1\n 5\n 6\n 7', 'test hunk');
                t.equal(change.hunks[1], '@@ -22,7 +21,7 @@\n 22\n 23\n 24\n-25\n+52\n 26\n 27\n 28', 'test hunk');
            }
            if (change.path == 'file3.txt'){
                t.equal(change.status, 'added', 'status is added');
                t.equal(change.size, 8, 'size is 8');
                t.false(change.oldsize, 'has no oldsize');
                t.equal(change.hunks[0], '@@ -0,0 +1,2 @@\n+foo\n+bar', 'test hunk');
            }

        });
    })
    .then(function(){
        t.end();
    })
    .catch(function(err){
        console.log(err.stack);
        t.error(err);
        t.end();
    });
});


tape('append but do not commit', function(t){
    files.appendFile(file1, 'i\nj\n')
    .then(function(){
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});


tape('diff HEAD~2', function(t){
    git.open(dir)
    .then(function(repo){
        return git.log(repo)
        .then(function(log){
            return git.diff(repo, log[2].commit);
        })
        .then(function(diff){
            return diff[0];
        })
        .then(function(change){
            return git.diff(repo, 'HEAD~2')
            .then(function(diffs){
                var diff = diffs[0];
                t.equal(diff.path, change.path, 'file1.txt');
                t.equal(diff.size, change.size, 'size is 20');
                t.equal(diff.oldsize, change.oldsize, 'oldsize is 8');
                t.equal(diff.hunks[0], change.hunks[0], change.hunks[0]);
                t.end();
            });
        });
    })
    .catch(function(err){
        console.log(err.stack);
        t.error(err);
        t.end();
    });
});

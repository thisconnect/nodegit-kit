var git = require('../');

var test = require('ava');
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


test.serial('state setup', function(t){
    return files.rmdir(dir)
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
    .catch(function(err){
        t.fail(err);
    });
});


test.serial('state get status', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.status(repo);
    })
    .then(function(status){
        t.truthy(status && status.length, 'got status');
        t.is(status.length, 2, 'got two items');

        t.truthy(status.some(function(file){
            return file.status == 'modified' && file.path == 'file2.txt';
        }), 'file2.txt is modified');

        t.truthy(status.some(function(file){
            return file.status == 'new' && file.path == 'file3.txt';
        }), 'file3.txt is new');
    })
    .catch(function(err){
        t.fail(err);
    });
});


var hunk1 = '@@ -1,7 +1,6 @@\n 1\n 2\n-3\n-4\n+3.1\n 5\n 6\n 7';
var hunk2 = '@@ -22,7 +21,7 @@\n 22\n 23\n 24\n-25\n+52\n 26\n 27\n 28';


test.serial('state get diff', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.diff(repo);
    })
    .then(function(changes){
        t.truthy(Array.isArray(changes), 'changes is an Array');
        changes.forEach(function(change){
            t.truthy(change.path, 'has path');
            t.truthy(change.size, 'has size');
            t.truthy(change.status, 'has status');

            if (change.status != 'modified') return;
            t.is(change.size, 78, 'size is 78');
            t.is(change.oldsize, 78, 'oldsize is 78');
            t.truthy(Array.isArray(change.hunks), 'hunks is an Array');
            t.truthy(change.hunks.length == 2, 'has 2 hunks');
            t.is(change.hunks[0], hunk1, 'test hunk 1');
            t.is(change.hunks[1], hunk2, 'test hunk 2');
        });
    })
    .catch(function(err){
        t.fail(err);
    });
});


test.serial('state commit changes', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.commit(repo)
        .then(function(){
            return files.appendFile(file1, 'e\nf\n');
        })
        .then(function(){
            return git.commit(repo, { message: 'appends to file1' });
        })
        .then(function(){
            return files.appendFile(file1, 'g\nh\n');
        })
        .then(function(){
            return git.commit(repo, { message: 'appends to file1' });
        });
    })
    .catch(function(err){
        t.fail(err);
    });
});


test.serial('state diff commit', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.log(repo, { sort: 'reverse' })
        .then(function(history){
            return history.map(function(log){
                return log.commit;
            });
        })
        .then(function(commits){
            return git.diff(repo, commits[2])
            .then(function(changes){
                var hunk = '@@ -4,3 +4,5 @@ c\n d\n e\n f\n+g\n+h';
                t.truthy(Array.isArray(changes), 'changes is an Array');
                t.is(changes.length, 1, 'has 1 change');
                t.is(changes[0].status, 'modified', 'status is modified');
                t.is(changes[0].size, 16, 'size is 16');
                t.is(changes[0].oldsize, 12, 'oldsize is 12');
                t.is(changes[0].hunks[0], hunk, 'test hunk');
            })
            .then(function(){
                var from = commits[1].slice(0, 10);
                var to = commits[3].slice(0, 10);
                return git.diff(repo, from, to);
            })
            .then(function(changes){
                var hunk = '@@ -2,3 +2,7 @@ a\n b\n c\n d\n+e\n+f\n+g\n+h';
                t.is(changes.length, 1, 'has 1 diff (2 commits same file)');
                t.is(changes[0].size, 16, 'size is 16');
                t.is(changes[0].oldsize, 8, 'oldsize is 8');
                t.is(changes[0].hunks[0], hunk, 'test hunk');
            })
            .then(function(){
                return git.diff(repo, commits[0], commits[3]);
            });
        });
    })
    .then(function(changes){
        changes.forEach(function(change){

            t.truthy(change.path, change.path);
            t.truthy(change.status, 'has status');
            if (change.path == 'file1.txt'){
                t.is(change.status, 'modified', 'status is modified');
                t.is(change.size, 16, 'size is 16');
                t.is(change.oldsize, 8, 'oldsize is 8');
                t.is(change.hunks[0], '@@ -2,3 +2,7 @@ a\n b\n c\n d\n+e\n+f\n+g\n+h', 'test hunk');

            }
            if (change.path == 'file2.txt'){
                t.is(change.status, 'modified', 'status is modified');
                t.is(change.size, 78, 'size is 78');
                t.is(change.oldsize, 78, 'oldsize is 78');
                t.is(change.hunks[0], '@@ -1,7 +1,6 @@\n 1\n 2\n-3\n-4\n+3.1\n 5\n 6\n 7', 'test hunk');
                t.is(change.hunks[1], '@@ -22,7 +21,7 @@\n 22\n 23\n 24\n-25\n+52\n 26\n 27\n 28', 'test hunk');
            }
            if (change.path == 'file3.txt'){
                t.is(change.status, 'added', 'status is added');
                t.is(change.size, 8, 'size is 8');
                t.falsy(change.oldsize, 'has no oldsize');
                t.is(change.hunks[0], '@@ -0,0 +1,2 @@\n+foo\n+bar', 'test hunk');
            }

        });
    })
    .catch(function(err){
        t.fail(err);
    });
});


test.serial('state append but do not commit', function(t){
    return files.appendFile(file1, 'i\nj\n')
    .catch(function(err){
        t.fail(err);
    });
});


test.serial('state get diff HEAD~2', function(t){
    return git.open(dir)
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
                t.is(diff.path, change.path, 'file1.txt');
                t.is(diff.size, change.size, 'size is 20');
                t.is(diff.oldsize, change.oldsize, 'oldsize is 8');
                t.is(diff.hunks[0], change.hunks[0], change.hunks[0]);
            });
        });
    })
    .catch(function(err){
        t.fail(err);
    });
});

test.serial('state get diff commit', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.log(repo, { sort: 'reverse' })
        .then(function(history){
            return history.map(function(log){
                return log.commit;
            });
        })
        .then(function(commits){
            return git.diff(repo, commits[0], commits[3]);
        });
    })
    .then(function(changes){
        changes.forEach(function(change){

            t.truthy(change.path, change.path);
            t.truthy(change.status, 'has status');
            if (change.path == 'file1.txt'){
                t.is(change.status, 'modified', 'status is modified');
                t.is(change.size, 16, 'size is 16');
                t.is(change.oldsize, 8, 'oldsize is 8');
                t.is(change.hunks[0], '@@ -2,3 +2,7 @@ a\n b\n c\n d\n+e\n+f\n+g\n+h', 'test hunk');

            }
            if (change.path == 'file2.txt'){
                t.is(change.status, 'modified', 'status is modified');
                t.is(change.size, 78, 'size is 78');
                t.is(change.oldsize, 78, 'oldsize is 78');
                t.is(change.hunks[0], '@@ -1,7 +1,6 @@\n 1\n 2\n-3\n-4\n+3.1\n 5\n 6\n 7', 'test hunk');
                t.is(change.hunks[1], '@@ -22,7 +21,7 @@\n 22\n 23\n 24\n-25\n+52\n 26\n 27\n 28', 'test hunk');
            }
            if (change.path == 'file3.txt'){
                t.is(change.status, 'added', 'status is added');
                t.is(change.size, 8, 'size is 8');
                t.falsy(change.oldsize, 'has no oldsize');
                t.is(change.hunks[0], '@@ -0,0 +1,2 @@\n+foo\n+bar', 'test hunk');
            }

        });
    })
    .catch(function(err){
        t.fail(err);
    });
});


test.serial('state test sha and sha1 in diff', function(t){
    return git.open(dir)
    .then(function(repo){
        return git.log(repo, { sort: 'reverse' })
        .then(function(history){
            return history.map(function(log){
                return log.commit;
            });
        })
        .then(function(commits){
            return git.diff(repo, commits[0], commits[3]);
        });
    })
    .then(function(changes){
        changes.forEach(function(change){
            t.truthy(change.path, change.path);
            t.truthy(change.sha1, 'has sha1');
            t.truthy(change.sha, 'has sha');
            if (change.path == 'file3.txt'){
                t.is(change.sha1, '0000000000000000000000000000000000000000', 'new files has a sha1 of 0000000');
            }
        });
    })
    .catch(function(err){
        t.fail(err);
    });
});

var git = require('../');

var tape = require('tape');
var files = require('fildes');
var resolve = require('path').resolve;

var dir = resolve(__dirname, './repos/state');
var file1 = resolve(dir, 'file1.txt');
var file2 = resolve(dir, 'file2.txt');
var file3 = resolve(dir, 'file3.txt');


tape('state setup', function(t){

    var data2 = '1\n2\n3\n4\n5\n6\n7\n8\n9\n'
        + '10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n'
        + '20\n21\n22\n23\n24\n25\n26\n27\n28\n29\n';

    files.rmdir(dir)
    .then(function(){
        return Promise.all([
            files.write(file1, 'a\nb\nc\nd\n'),
            files.write(file2, data2)
        ]);
    })
    .then(function(){
        return git.open(dir);
    })
    .then(function(repo){
        return git.commit(repo);
    })
    .then(function(){
        return Promise.all([
            files.write(file2, '3.1', {
                position: 4
            }),
            files.write(file2, '52', {
                position: 63
            }),
            files.writeFile(file3, 'foo\nbar\n')
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


tape('diff', function(t){
    git.open(dir)
    .then(function(repo){
        return git.diff(repo);
    })
    .then(function(changes){
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
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});

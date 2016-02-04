var git = require('../');

var test = require('ava');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir = resolve(__dirname, './repos/open');


test.serial('open setup', function(t){
    return files.rmdir(dir)
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});


test.serial('open error', function(t){
    return git.open(dir, {
        'init': false
    })
    .then(function(repo){
        t.fail('should not open uninitialized repo');
    })
    .catch(function(error){
        t.ok(error, error);
    });
});


test.serial('open should create a new repo', function(t){
    return git.open(dir)
    .then(function(repo){
        t.ok(repo, 'has repo');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});

var git = require('../');

var tape = require('tape');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir = resolve(__dirname, './repos/open');


tape('open setup', function(t){
    files.rmdir(dir)
    .then(function(){
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});


tape('open error', function(t){
    git.open(dir, {
        'init': false
    })
    .then(function(repo){
        t.fail('should not open uninitialized repo');
        t.end();
    })
    .catch(function(error){
        t.ok(error, error);
        t.end();
    });
});


tape('open should create a new repo', function(t){
    git.open(dir)
    .then(function(repo){
        t.ok(repo, 'has repo');
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});

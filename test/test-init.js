var git = require('../');

var tape = require('tape');
var Git = require('nodegit');
var files = require('fildes');
var resolve = require('path').resolve;

var dir = resolve(__dirname, './repos/init');
var bare = resolve(__dirname, './repos/init-bare.git');


tape('init setup', function(t){
    Promise.all([
        files.rmdir(dir),
        files.rmdir(bare)
    ])
    .then(function(){
        t.end();
    })
    .catch(function(err){
        t.error(err);
        t.end();
    });
});


tape('init error', function(t){
    files.writeFile(dir)
    .then(function(){
        return git.init(dir);
    })
    .then(function(repo){
        t.fail('should not initialize repository on a file');
        t.end();
    })
    .catch(function(error){
        t.ok(error, error);
        t.end();
    });
});


tape('init', function(t){
    files.unlink(dir)
    .then(function(){
        return git.init(dir, {
            'message': 'the very first commit'
        });
    })
    .then(function(repo){
        t.ok(repo, 'initialized repository');
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('reinit', function(t){
    git.init(dir)
    .then(function(repo){
        t.ok(repo, 'reinitialized existing repository');
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('init bare', function(t){
    git.init(bare, {
        'bare': 1
    })
    .then(function(repo){
        t.ok(repo, 'initialized bare repository');
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});

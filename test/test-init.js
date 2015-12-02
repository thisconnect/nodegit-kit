var git = require('../');

var tape = require('tape');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir = resolve(__dirname, './repos/init');
var bare = resolve(__dirname, './repos/init-bare.git');
var manual = resolve(__dirname, './repos/init-manual');


tape('init setup', function(t){
    Promise.all([
        files.rmdir(dir),
        files.rmdir(bare),
        files.rmdir(manual)
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
    files.writeFile(dir, '')
    .then(function(){
        return git.init(dir);
    })
    .then(function(repo){
        t.fail('should not initialize repository on a file');
        t.end();
    })
    .catch(function(error){
        t.ok(error, error);
        return files.rmdir(dir);
    })
    .then(function(){
        t.end();
    });
});


tape('init', function(t){
    git.init(dir, {
        'message': 'the very first commit'
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


tape('init without commit', function(t){
    git.init(manual, {
        'commit': false
    })
    .then(function(repo){
        t.ok(repo, 'initialized repository without first commit');
        // add files or change configs before first commit
        return repo.getMasterCommit()
        .then(function(master){
            t.fail('should have no master commit yet');
            t.end();
        })
        .catch(function(error){
            t.ok(error, error);
            // manually do first commit
            return git.init.commit(repo);
        })
        .then(function(oid){
            t.ok(oid, 'has oid');
            return repo.getMasterCommit()
            .then(function(commit){
                t.ok(commit, 'has master commit');
                t.deepEqual(oid, commit.id(), 'same Oid');
                t.end();
            });
        });
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});

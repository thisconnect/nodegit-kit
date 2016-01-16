var git = require('../');

var test = require('ava');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir = resolve(__dirname, './repos/init');
var bare = resolve(__dirname, './repos/init-bare.git');
var manual = resolve(__dirname, './repos/init-manual');


test.serial('init setup', function(t){
    return Promise.all([
        files.rmdir(dir),
        files.rmdir(bare),
        files.rmdir(manual)
    ])
    .catch(function(err){
        t.fail(err);
    });
});


test.serial('init error', function(t){
    return files.writeFile(dir, '')
    .then(function(){
        return git.init(dir);
    })
    .then(function(repo){
        t.fail('should not initialize repository on a file');
    })
    .catch(function(error){
        t.ok(error, error);
        return files.rmdir(dir);
    });
});


test.serial('init', function(t){
    return git.init(dir, {
        'message': 'the very first commit'
    })
    .then(function(repo){
        t.ok(repo, 'initialized repository');
    })
    .catch(function(error){
        t.fail(error);
    });
});


test.serial('init reinitialize', function(t){
    return git.init(dir)
    .then(function(repo){
        t.ok(repo, 'reinitialized existing repository');
    })
    .catch(function(error){
        t.fail(error);
    });
});


test.serial('init bare', function(t){
    return git.init(bare, {
        'bare': 1
    })
    .then(function(repo){
        t.ok(repo, 'initialized bare repository');
    })
    .catch(function(error){
        t.fail(error);
    });
});


test.serial('init without commit', function(t){
    return git.init(manual, {
        'commit': false
    })
    .then(function(repo){
        t.ok(repo, 'initialized repository without first commit');
        // add files or change configs before first commit
        return repo.getMasterCommit()
        .then(function(master){
            t.fail('should have no master commit yet');
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
                t.same(oid, commit.id(), 'same Oid');
            });
        });
    })
    .catch(function(error){
        t.fail(error);
    });
});

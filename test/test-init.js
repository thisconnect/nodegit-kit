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
    .catch(function(error){
        console.log(error);
        t.fail(error);
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
        t.truthy(error, error);
        return files.rmdir(dir);
    });
});


test.serial('init', function(t){
    return git.init(dir, {
        'message': 'the very first commit'
    })
    .then(function(repo){
        t.truthy(repo, 'initialized repository');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});


test.serial('init reinitialize', function(t){
    return git.init(dir)
    .then(function(repo){
        t.truthy(repo, 'reinitialized existing repository');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});


test.serial('init bare', function(t){
    return git.init(bare, {
        'bare': 1
    })
    .then(function(repo){
        t.truthy(repo, 'initialized bare repository');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});


test.serial('init without commit', function(t){
    return git.init(manual, {
        'commit': false
    })
    .then(function(repo){
        t.truthy(repo, 'initialized repository without first commit');
        // add files or change configs before first commit
        return repo.getMasterCommit()
        .then(function(master){
            t.fail('should have no master commit yet');
        })
        .catch(function(error){
            t.truthy(error, error);
            // manually do first commit
            return git.init.commit(repo);
        })
        .then(function(oid){
            t.truthy(oid, 'has oid');
            return repo.getMasterCommit()
            .then(function(commit){
                t.truthy(commit, 'has master commit');
                t.deepEqual(oid, commit.id(), 'same Oid');
            });
        });
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});

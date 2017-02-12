var git = require('../');

var test = require('ava');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir1 = resolve(__dirname, './repos/config');
var dir2 = resolve(__dirname, './repos/config-global');
var file1 = resolve(dir1, 'file.txt');
var file2 = resolve(dir2, 'file.txt');


test.serial('config setup', function(t){
    return Promise.all([
        files.rmdir(dir1),
        files.rmdir(dir2)
    ])
    .then(function(){
        return Promise.all([
            files.write(file1, 'a\nb\nc\nd\n'),
            files.write(file2, 'a\nb\nc\nd\n')
        ]);
    })
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});


test.serial('config test init with local user', function(t){
    return git.init(dir1, {
        'commit': false
    })
    .then(function(repo){
        return git.config.set(repo, {
            'user.name': 'test',
            'user.email': 'test@localhost'
        })
        .then(function(){
            return git.init.commit(repo);
        })
        .then(function(oid){
            t.truthy(oid, 'has oid');

            return repo.getMasterCommit()
            .then(function(master){
                var history = master.history();
                history.on('commit', function(commit){
                    var author = commit.author();
                    t.is(author.name(), 'test', 'author name is test');
                    t.is(author.email(), 'test@localhost', 'author email is test@localhost');
                    t.truthy(oid.equal(commit.id()), 'oid is equal');
                });
                history.on('end', function(commits){
                    t.truthy(commits, 'has commits');
                    t.is(commits.length, 1, 'has 1 commit');
                });
                history.start();
            });
        });
    })
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});


test.serial('config test overwrite user', function(t){
    return git.open(dir1)
    .then(function(repo){
        return git.config.set(repo, {
            // user can be an object with name and or email
            'user': {
                'name': 'John Doe',
                'email': 'johndoe@example.com'
            }
        })
        .then(function(){
            return git.config.get(repo, ['user.name', 'user.email']);
        })
        .then(function(config){
            t.is(config[0], 'John Doe');
            t.is(config[1], 'johndoe@example.com');
            return Promise.all([
                git.config.set(repo, {'user.name': 'test'}),
                git.config.set(repo, {'user.email': 'test@localhost'})
            ])
            .catch(function(error){
                t.pass('expect lock error');
                t.truthy(error, error);
                return;
            });
        })
        .then(function(){
            return git.config.set(repo, {
                'user.name': 'test',
                'user.email': 'test@localhost'
            });
        });
    })
    .catch(function(err){
        console.log(err);
        t.fail(err);
    });
});


test.serial('config core.autocrlf', function(t){
    return git.open(dir1)
    .then(function(repo){
        return git.config.set(repo, {
            'core.autocrlf': 'input'
        })
        .then(function(){
            return repo;
        });
    })
    .then(function(repo){
        return git.config.get(repo, 'core.autocrlf');
    })
    .then(function(autocrlf){
        t.truthy(autocrlf, 'got core.autocrlf');
        t.is(autocrlf, 'input', 'core.autocrlf is input');
    })
    .catch(function(err){
        console.log(err);
        t.fail(err, err.message);
    });
});


test.serial('config set a number (core.abbrev)', function(t){
    return git.open(dir1)
    .then(function(repo){
        return git.config.set(repo, {
            'core.abbrev': 11
        })
        .then(function(){
            return git.config.get(repo, 'core.abbrev');
        });
    })
    .then(function(abbrev){
        t.truthy(abbrev, 'got core.abbrev');
        t.is(Number(abbrev), 11, 'core.abbrev is 11');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error, error.message);
    });
});


test.serial('config get local user', function(t){
    return git.open(dir1)
    .then(function(repo){
        return git.config.get(repo, ['user.name', 'user.email']);
    })
    .then(function(config){
        t.truthy(config[0], config[0]);
        t.truthy(config[1], config[1]);
        t.truthy(config[0] == 'test', 'user.name is test');
        t.truthy(config[1] == 'test@localhost', 'user.email is test@localhost');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});

// add test on ci when no global git user is configured

test.serial('config init without local user', function(t){
    return git.open(dir2)
    .then(function(repo){
        return repo.getMasterCommit();
    })
    .then(function(master){
        var history = master.history();
        history.on('commit', function(commit){
            var author = commit.author();
            t.truthy(author.name(), author.name());
            t.truthy(author.email(), author.email());
        });
        history.on('end', function(commits){
            t.truthy(commits, 'has commits');
            t.is(commits.length, 1, 'has 1 commit');
        });
        history.start();
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});


test.serial('config get user from repo without local user', function(t){
    return git.open(dir2)
    .then(function(repo){
        return git.config.get(repo, ['user.name', 'user.email']);
    })
    .then(function(config){
        t.truthy(config[0], config[0]);
        t.truthy(config[1], config[1]);
        t.truthy(config[0] != 'test', 'user.name is not test');
        t.truthy(config[1] != 'test@localhost', 'user.email is not test@localhost');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});


test.serial('config get global user', function(t){
    return Promise.all([
        git.config.get('user.name'),
        git.config.get('user.email')
    ])
    .then(function(config){
        t.truthy(config[0], config[0]);
        t.truthy(config[1], config[1]);
        t.truthy(config[0] != 'test', 'user.name is not test');
        t.truthy(config[1] != 'test@localhost', 'user.email is not test@localhost');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});


test.serial('config get multiple global user configs', function(t){
    return git.config.get(['user.name', 'user.email'])
    .then(function(config){
        t.truthy(config[0], config[0]);
        t.truthy(config[1], config[1]);
        t.truthy(config[0] != 'test', 'user.name is not test');
        t.truthy(config[1] != 'test@localhost', 'user.email is not test@localhost');
    })
    .catch(function(error){
        console.log(error);
        t.fail(error);
    });
});


test.serial('config get non-existent config key', function(t){
    return git.config.get('core.fakekey')
    .then(function(config){
        t.fail('should not get non-existent config key');
    })
    .catch(function(error){
        t.truthy(error, error);
    });
});

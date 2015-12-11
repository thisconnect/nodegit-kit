var git = require('../');

var tape = require('tape');
var files = require('fildes-extra');
var resolve = require('path').resolve;

var dir1 = resolve(__dirname, './repos/config');
var dir2 = resolve(__dirname, './repos/config-global');
var file1 = resolve(dir1, 'file.txt');
var file2 = resolve(dir2, 'file.txt');


tape('config setup', function(t){
    Promise.all([
        files.rmdir(dir1),
        files.rmdir(dir2)
    ])
    .then(function(){
        return Promise.all([
            files.write(file1, 'a\nb\nc\nd\n'),
            files.write(file2, 'a\nb\nc\nd\n')
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


tape('init with local user config', function(t){
    git.init(dir1, {
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
            t.ok(oid, 'has oid');

            return repo.getMasterCommit()
            .then(function(master){
                var history = master.history();
                history.on('commit', function(commit){
                    var author = commit.author();
                    t.equal(author.name(), 'test', 'author name is test');
                    t.equal(author.email(), 'test@localhost', 'author email is test@localhost');
                    t.deepEqual(oid, commit.id(), 'same Oid');
                });
                history.on('end', function(commits){
                    t.ok(commits, 'has commits');
                    t.equal(commits.length, 1, 'has 1 commit');
                    t.end();
                });
                history.start();
            });
        });
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('overwrite user config', function(t){
    git.open(dir1)
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
            t.equal(config[0], 'John Doe');
            t.equal(config[1], 'johndoe@example.com');
            return Promise.all([
                git.config.set(repo, {'user.name': 'test'}),
                git.config.set(repo, {'user.email': 'test@localhost'})
            ])
            .catch(function(error){
                t.pass('expect lock error');
                t.ok(error, error);
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
    .then(function(){
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('config core.autocrlf', function(t){
    git.open(dir1)
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
        t.ok(autocrlf, 'got core.autocrlf');
        t.equal(autocrlf, 'input', 'core.autocrlf is input');
        t.end();
    })
    .catch(function(error){
        t.error(error, error.message);
        t.end();
    });
});


tape('config set a number (core.abbrev)', function(t){
    git.open(dir1)
    .then(function(repo){
        return git.config.set(repo, {
            'core.abbrev': 11
        })
        .then(function(){
            return git.config.get(repo, 'core.abbrev');
        });
    })
    .then(function(abbrev){
        t.ok(abbrev, 'got core.abbrev');
        t.equal(Number(abbrev), 11, 'core.abbrev is 11');
        t.end();
    })
    .catch(function(error){
        t.error(error, error.message);
        t.end();
    });
});


tape('get local config', function(t){
    git.open(dir1)
    .then(function(repo){
        return git.config.get(repo, ['user.name', 'user.email']);
    })
    .then(function(config){
        t.ok(config[0], config[0]);
        t.ok(config[1], config[1]);
        t.ok(config[0] == 'test', 'user.name is test');
        t.ok(config[1] == 'test@localhost', 'user.email is test@localhost');
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});

// add test on ci when no global git user is configured

tape('init without local user config', function(t){
    git.open(dir2)
    .then(function(repo){
        return repo.getMasterCommit();
    })
    .then(function(master){
        var history = master.history();
        history.on('commit', function(commit){
            var author = commit.author();
            t.ok(author.name(), author.name());
            t.ok(author.email(), author.email());
        });
        history.on('end', function(commits){
            t.ok(commits, 'has commits');
            t.equal(commits.length, 1, 'has 1 commit');
            t.end();
        });
        history.start();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('get user config from repo without local user', function(t){
    git.open(dir2)
    .then(function(repo){
        return git.config.get(repo, ['user.name', 'user.email']);
    })
    .then(function(config){
        t.ok(config[0], config[0]);
        t.ok(config[1], config[1]);
        t.ok(config[0] != 'test', 'user.name is not test');
        t.ok(config[1] != 'test@localhost', 'user.email is not test@localhost');
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('get global config', function(t){
    Promise.all([
        git.config.get('user.name'),
        git.config.get('user.email')
    ])
    .then(function(config){
        t.ok(config[0], config[0]);
        t.ok(config[1], config[1]);
        t.ok(config[0] != 'test', 'user.name is not test');
        t.ok(config[1] != 'test@localhost', 'user.email is not test@localhost');
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


tape('get multiple global configs', function(t){
    git.config.get(['user.name', 'user.email'])
    .then(function(config){
        t.ok(config[0], config[0]);
        t.ok(config[1], config[1]);
        t.ok(config[0] != 'test', 'user.name is not test');
        t.ok(config[1] != 'test@localhost', 'user.email is not test@localhost');
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});

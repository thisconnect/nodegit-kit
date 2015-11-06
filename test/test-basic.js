/*
var git = require('../');

var tape = require('tape');
var resolve = require('path').resolve;


tape('config core.autocrlf', function(t){
    var path = resolve(__dirname, './repos/basic');

    git.init(path)
    .then(function(repo){
        t.pass('repo created');
        t.end();
    })
    .catch(function(error){
        t.error(error, error.message);
        t.end();
    });
});
*/

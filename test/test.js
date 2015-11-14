var debug = require('debug');
debug.log = console.log.bind(console);

var tape = require('tape');
var resolve = require('path').resolve;
var files = require('fildes');

tape('setup', function(t){
    var path = resolve(__dirname, './repos');

    files.rmdir(path)
    .then(function(){
        t.end();
    })
    .catch(function(error){
        t.error(error);
        t.end();
    });
});


require('./test-init.js');
require('./test-open.js');
require('./test-commits.js');
require('./test-state.js');
require('./test-config.js');

'use strict';

var Git = require('nodegit');
var path = require('path');
var mkdirp = require('mkdirp');
var debug = require('debug')('open');

var init = require('./init');

module.exports = function(dirname){

    var dir = path.resolve(dirname);

    return Git.Repository.open(dir)
    .then(function(repo){
        debug('repo %s', dirname);
        return repo;
    })
    .catch(function(error){
        return init({
            'path': dirname
        });
    })
    .catch(function(error){
        debug(error);
    });

};

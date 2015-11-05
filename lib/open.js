'use strict';

var Git = require('nodegit');
var debug = require('debug')('kit:open');

var init = require('./init.js');

module.exports = function(dir, o){
    o = o || {};

    return Git.Repository.open(dir)
    .then(function(repo){
        debug('open %s', dir);
        return repo;
    })
    .catch(function(err){
        if (o.init !== false){
            return init(dir);
        }
        throw err;
    });

};

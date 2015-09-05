'use strict';

var Git = require('nodegit');

module.exports = function(repo){

    return repo.index()
    .then(function(index){
        return index.removeAll()
        .then(function(){
            return index.addAll();
        })
        .then(function(){
            return index.write();  // sync
        })
        .then(function(){
            return index.writeTree(); // oid
        });
    });

};

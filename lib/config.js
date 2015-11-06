'use strict';

var Git = require('nodegit');

module.exports = {

    set: function(repo, o){
        o = o || {};

        return repo.config()
        .then(function(config){
            return Promise.resolve()
            .then(function(){
                if (!o.user || !o.user.name) return;
                return config.setString('user.name', o.user.name);
            })
            .then(function(){
                if (!o.user || !o.user.email) return;
                return config.setString('user.email', o.user.email);
            });
        });
    },

    getUser: function(){
        return new Promise(function(resolve, reject){
            return Git.Config.openDefault()
            .then(function(config){
                return Promise.all([config.getString('user.name'), config.getString('user.email')]);
            })
            .then(function(user){
                resolve({
                    'name': user[0],
                    'email': user[1]
                });
            })
            .catch(function(user){
                resolve({
                    'name': 'anonymous',
                    'email': user[1]
                });
            });
        });
    },

    getSignature: function(){
        return this.getUser()
        .then(function(user){
            return Git.Signature.now(user.name, user.email);
        });
    }

};

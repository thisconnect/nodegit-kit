'use strict';

var Git = require('nodegit');

var user = null;

module.exports = {

    set: function(data){
        user = data.user;
    },

    getUser: function(){
        return new Promise(function(resolve, reject){
            if (!!user){
                return resolve(user);
            }
            return Git.Config.openDefault()
            .then(function(config){
                return Promise.all([config.getString('user.name'), config.getString('user.email')]);
            })
            .then(function(user){
                return {
                    'name': user[0],
                    'email': user[1]
                };
            })
            .then(resolve)
            .catch(reject);
        })
    },

    getSignature: function(){
        return this.getUser()
        .then(function(user){
            return Git.Signature.now(user.name, user.email);
        });
    }

};

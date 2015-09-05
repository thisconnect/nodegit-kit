'use strict';

var Git = require('nodegit');

module.exports = {

    getUser: function(){
        return new Promise(function(resolve, reject){
            Git.Config.openDefault().then(resolve);
        })
        .then(function(config){
            return Promise.all([config.getString('user.name'), config.getString('user.email')]);
        })
        .then(function(user){
            return {
                'name': user[0],
                'email': user[1]
            };
        });
    },

    getSignature: function(){
        return this.getUser()
        .then(function(user){
            return Git.Signature.now(user.name, user.email);
        });
    }

};

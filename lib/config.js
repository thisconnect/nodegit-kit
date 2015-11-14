'use strict';

var Git = require('nodegit');

function setUser(config, user){
    return Promise.resolve()
    .then(function(){
        if (!user.name) return;
        return config.setString('user.name', user.name);
    })
    .then(function(){
        if (!user.email) return;
        return config.setString('user.email', user.email);
    });
}

function getConfigs(config, options){
    if (typeof options == 'string'){
        return config.getString(options);
    }
    if (!Array.isArray(options)){
        return;
    }
    return Promise.all(options.map(function(option){
        return config.getString(option);
    }));
}

function sequential(all){
    return all.reduce(function(prev, current){
        return prev = prev.then(current);
    }, Promise.resolve());
}

function setConfig(config, key, value){
    return function(){
        return config.setString(key, value);
    };
}

module.exports = {

    set: function(repo, o){
        var options = o || repo;
        return (!!o ? repo.config() : Git.Config.openDefault())
        .then(function(config){
            var changes = [];
            for (var key in options){
                if (key == 'user') continue;
                changes.push(setConfig(config, key, options[key]));
            }
            return sequential(changes)
            .then(function(){
                return config;
            });
        })
        .then(function(config){
            if (!options.user) return;
            return setUser(config, options.user);
        });
    },

    get: function(repo, o){
        var options = o || repo;
        return (!!o ? repo.config() : Git.Config.openDefault())
        .then(function(config){
            return getConfigs(config, options);
        });
    },

    getSignature: function(repo){
        var user = ['user.name', 'user.email'];
        return (!!repo ? this.get(repo, user) : this.get(user))
        .then(function(user){
            return Git.Signature.now(user[0], user[1]);
        });
    }

};

/*
function getConfigsByObject(config, options){

    if (options != null && typeof options == 'object'){
        var values = [];
        for (var key in options){
            values.push({
                'key': key,
                'value': options[key]
            });
        }

        return Promise.all(values.map(function(value){
            return config.getString(value);
        }))
        .then(function(results){
            var data = {};
            values.forEach(function(value, i){
                data[value.key] = results[i]
            });
            return data;
        });
    }
}
*/

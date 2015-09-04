NodeGit-Kit
===


```javascript

var kit = require('nodegit-kit');

var open = kit.open;
var commit = kit.commit;
var diff = kit.diff;
var log = kit.log;
var status = kit.status;

open('a-new-repo')
.then(function(repo){
    return repo;
})
.then(function(repo){
     // git status
    return status(repo)
    .then(function(statuses){
        // console.log(statuses);
    })
    .then(function(){
        // git diff
        return diff(repo);
    })
    .then(function(diff){
        // console.log(diff);
        return repo;
    });
})
.then(function(repo){
    // git commit -am""
    return commit(repo);
})
.then(function(repo){
    // git log
    return log(repo);
})
.then(function(log){
    // console.log(log);
})
.catch(function(error){
    console.error(error.stack);
});

```

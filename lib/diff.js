'use strict';

var Git = require('nodegit');
var debug = require('debug')('kit:diff');


module.exports = function(repo){
    return repo.getBranchCommit('master')
    .then(function(commit){
        return commit.getTree();
    })
    .then(function(tree){
        return repo.openIndex();
    })
    .then(function(index){
        return Git.Diff.indexToWorkdir(repo, index, {
            'flags': Git.Diff.OPTION.INCLUDE_UNTRACKED |
                Git.Diff.OPTION.INCLUDE_UNREADABLE |
                Git.Diff.OPTION.SKIP_BINARY_CHECK
        });
    })
    .then(function(diff){
        return diff.patches();
    })
    .then(function(patches){
        var diff = [];

        if (!patches.length) throw 'nothing changed';

        patches.forEach(function(patch){
            // { oldFile: [Function],
            // newFile: [Function],
            // size: [Function],
            // hunks: [Function],
            // status: [Function],
            // isUnmodified: [Function],
            // isAdded: [Function],
            // isDeleted: [Function],
            // isModified: [Function],
            // isRenamed: [Function],
            // isCopied: [Function],
            // isIgnored: [Function],
            // isUntracked: [Function],
            // isTypeChange: [Function] }

            var file = patch.newFile();

            var status;
            if (patch.isUnmodified()) status = 'unmodified';
            else if (patch.isAdded()) status = 'added';
            else if (patch.isDeleted()) status = 'deleted';
            else if (patch.isModified()) status = 'modified';
            else if (patch.isRenamed()) status = 'renamed';
            else if (patch.isCopied()) status = 'copied';
            else if (patch.isIgnored()) status = 'ignored';
            else if (patch.isUntracked()) status = 'untracked';
            else if (patch.isTypeChange()) status = 'typechange';

            var entry = {
                'status': status,
                'path': file.path(),
                'size': file.size()
            };

            if (status == 'modified'){
                var oldfile = patch.oldFile();
                var changes = [];

                if (entry.path != oldfile.path()){
                    entry.oldpath = oldfile.path();
                }
                entry.oldsize = oldfile.size();

                patch.hunks().forEach(function(hunk){

                    changes.push(hunk.header().trim());

                    hunk.lines().forEach(function(line, i){

                        var change = ' ';

                        if (line.newLineno() == -1) change = '-';
                        else if (line.oldLineno() == -1) change = '+';

                        changes.push(change + line.content().trim());
                    });
                });
                entry.diff = changes;
            }
            debug('%s %s', entry.status, entry.path);
            diff.push(entry);
        });
        return diff;
    })
    .catch(function(error){
        debug(error);
        return repo;
    });

};

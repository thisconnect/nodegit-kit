'use strict';

var Git = require('nodegit');
var debug = require('debug')('kit:diff');

function getHunks(hunk){
    return hunk.lines()
    .then(function(lines){
        return lines.map(function(line, i){
            var change = ' ';

            if (line.newLineno() == -1) change = '-';
            else if (line.oldLineno() == -1) change = '+';

            return change + line.content().trim();
        });
    })
    .then(function(diff){
        var result = [hunk.header().trim()];
        return result.concat(diff).join('\n');
    });
}

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

function getInfo(patch){
    return new Promise(function(resolve, reject){
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
        resolve(status);
    })
    .then(function(status){
        var file = patch.newFile();
        return {
            'status': status,
            'path': file.path(),
            'size': file.size()
        };
    })
    .then(function(entry){
        debug('%s %s', entry.status, entry.path);
        if (entry.status != 'modified'){
            return entry;
        }

        var oldfile = patch.oldFile();
        if (entry.path != oldfile.path()){
            entry.oldpath = oldfile.path();
        }
        entry.oldsize = oldfile.size();
        return entry;
    })
    .then(function(entry){
        return patch.hunks()
        .then(function(hunks){
            return Promise.all(hunks.map(getHunks));
        })
        .then(function(hunks){
            entry.hunks = hunks;
            return entry;
        });
    });
}

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
        if (!patches.length){
            return null;
        }
        return Promise.all(patches.map(getInfo));
    });
};

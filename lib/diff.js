'use strict';

var Git = require('nodegit');
var debug = require('debug')('kit:diff');

var get = require('./get.js');

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
            'sha1': patch.oldFile().id().tostrS(),
            'sha': file.id().tostrS(),
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

var diffIndex = function(repo, commit){

    return commit.getTree()
    .then(function(tree){
        // repo.openIndex was removed http://www.nodegit.org/changelog/#v0-13-0
        return repo.refreshIndex();
    })
    .then(function(index){
        return Git.Diff.indexToWorkdir(repo, index, {
            'flags': Git.Diff.OPTION.INCLUDE_UNTRACKED |
                Git.Diff.OPTION.INCLUDE_UNREADABLE |
                Git.Diff.OPTION.SKIP_BINARY_CHECK
        })
        .then(function(diff){
            return diff.patches();
        });
    });
};

var diffCommit = function(commit){
    return commit.getDiff()
    .then(function(diff){
        // TODO:
        return diff[0].patches();
    });
};

var diffTree = function(current, tree){
    return current.diff(tree)
    .then(function(diffList){
        return diffList.patches();
    });
};

// git.diff(repo)
// git.diff(repo, commit1)
// git.diff(repo, commit1, commit2)
// TODO:
// git.diff(repo, commit1, { branch: 'dev'})
// git.diff(repo, {branch: 'master'}, { branch: 'dev'})
// git.diff(repo, {branch: 'master'}, commit2)
// git.diff(repo, {tree: 'x'}, { commit: 'y'})

var diffWorkdir = function(repo, commit){
    return commit.getTree()
    .then(function(tree){
        return Git.Diff.treeToWorkdir(repo, tree);
    })
    .then(function(diff){
        return diff.patches();
    });
};


module.exports = function(repo, o, o2){

    return get(repo, o)
    .then(function(from){

        if (!!o2){
            return get(repo, o2)
            .then(function(to){
                return Promise.all([to.getTree(), from.getTree()])
            })
            .then(function(trees){
                return diffTree(trees[0], trees[1]);
            });
        }

        if (!!o){
            return diffWorkdir(repo, from);
        }

        return diffIndex(repo, from);
    })
    .then(function(patches){
        if (!patches.length){
            return [];
        }
        return Promise.all(patches.map(getInfo));
    });
};

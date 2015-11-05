'use strict';

var Git = require('nodegit');
var debug = require('debug')('kit:status');

// { status: [Function],
// statusBit: [Function],
// headToIndex: [Function],
// indexToWorkdir: [Function],
// path: [Function],
// isNew: [Function],
// isModified: [Function],
// isDeleted: [Function],
// isTypeChange: [Function],
// isRenamed: [Function],
// isIgnored: [Function],
// inWorkingTree: [Function],
// inIndex: [Function] }

function getStatus(file){
    var status;

    if (file.isNew()) status = 'new';
    else if (file.isModified()) status = 'modified';
    else if (file.isDeleted()) status = 'deleted';
    else if (file.isTypeChange()) status = 'typechange';
    else if (file.isRenamed()) status = 'renamed';
    else if (file.isIgnored()) status = 'ignored';

    debug('%s %s', status, file.path());
    return {
        'path': file.path(),
        'status': status
    };
}

module.exports = function(repo){
    return repo.getStatus()
    .then(function(files){
        if (!files.length) return [];
        return files.map(getStatus);
    });
};

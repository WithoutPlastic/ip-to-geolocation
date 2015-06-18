'use strict';

var fs = require('fs'),
    path = require('path');

var headOffsetSectionBytes = 4;

/**
 * TODO: Load from local ip geo location .dat file to memory.
 *
 * @param {string} dataFilePath
 * @param {function} callback - Params: err, loadedBufferTable.
 * @api private
 */

var loadDatFormat = function loadDatFormat(dataFilePath, callback) {
    var parseData = function parseData(buffer) {
        var indexBufferEndSection = buffer.slice(0, headOffsetSectionBytes),
            indexBufferEndOffset = indexBufferEndSection.readInt32BE(0);

        callback(null, {
            dataBuffer: buffer,
            indexBufferEndOffset: indexBufferEndOffset,
            indexBuffer: buffer.slice(headOffsetSectionBytes, indexBufferEndOffset)
        });
    };

    fs.readFile(dataFilePath, { encoding: null, flag: 'r' }, function (err, buffer) {
        err ? callback(err) : parseData(buffer);
    });
};

/**
 * Load from local ip geo location .datx file to memory.
 *
 * @param {string} dataFilePath
 * @param {function} callback - Params: err, loadedBufferTable.
 * @api private
 */

var loadDatxFormat = function loadDatxFormat(dataFilePath, callback) {
    callback(new Error('datx data format not support'));
};

/**
 * Load from local ip geo location database file to memory.
 *
 * @param {string} dataFilePath
 * @param {function} callback - Params: err, loadedBufferTable.
 * @api public
 */

var load = function load(dataFilePath, callback) {
    var normalizedDataFilePath = path.normalize(dataFilePath),
        extension = path.extname(normalizedDataFilePath);

    switch (extension) {
        case '.dat':
            loadDatFormat(dataFilePath, callback);
            break;
        case '.datx':
            loadDatxFormat(dataFilePath, callback);
            break;
        default:
            callback(new Error('Unknown data file format'));
    }
};

module.exports = { load: load };

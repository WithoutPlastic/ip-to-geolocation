'use strict';

var localDataLoader = require('./local.data.loader.js');

var invalidInputReturnValue = { country: '', province: '', city: '', organization: '' },
    returnNotSupportError = function returnNotSupportError(input, callback) {
    return callback(new Error('Not support error'));
};

var bufferTable = null;

var validateIPAddress = function validateIPAddress(ipAddress) {
    var ipAddressSlice = ipAddress.trim().split('.'),
        ipAddressNumber = ipAddressSlice.map(function (slice) {
        return parseInt(slice, 10);
    }),
        validateIPSliceNumber = function validateIPSliceNumber(n) {
        return !isNaN(n) && typeof n === 'number' && 0 <= n && n <= 255;
    };

    return ipAddressNumber.length === 4 && ipAddressNumber.every(validateIPSliceNumber);
};

/**
 * TODO: Query geo location by ip v6 address.
 *
 * @param {string} ipAddress
 * @param {function} callback - Params: err, geoLocationObject.
 * @api public
 */

var queryIPv6 = returnNotSupportError;

/**
 * TODO: Query geo location by domain name.
 *
 * @param {string} domainName
 * @param {function} callback - Params: err, geoLocationObject.
 * @api public
 */

var queryDomain = returnNotSupportError;

/**
 * Query geo location by ip v4 address.
 *
 * - Keep async callback even query from in-memory database.
 *
 * @param {string} ipAddress
 * @param {function} callback - Params: err, geoLocationObject.
 * @api public
 */

var queryIPv4 = function queryIPv4(ipAddress, callback) {
    var dataBuffer = bufferTable.dataBuffer,
        indexBuffer = bufferTable.indexBuffer,
        indexBufferEndOffset = bufferTable.indexBufferEndOffset,
        ipSliceList = ipAddress.trim().split('.'),
        highSliceNumber = parseInt(ipSliceList[0], 10),
        indexOffsetBytesL1 = highSliceNumber * 4,
        ipInInt32 = new Buffer(ipSliceList).readInt32BE(0),
        parseInformationSection = function parseInformationSection(offset, length) {
        var resultArray = dataBuffer.slice(indexBufferEndOffset + offset - 1024, indexBufferEndOffset + offset - 1024 + length).toString('utf-8').split('\t');

        callback(null, resultArray.length !== 4 ? invalidInputReturnValue : {
            country: resultArray[0],
            province: resultArray[1],
            city: resultArray[2],
            organization: resultArray[3]
        });
    },
        iterate = function iterate() {
        var offset = indexBuffer.slice(indexOffsetBytesL1, indexOffsetBytesL1 + 4).readInt32LE(0);

        for (offset = offset * 8 + 1024; offset < indexBufferEndOffset - 1024 - 4; offset += 8) {
            if (ipInInt32 <= indexBuffer.slice(offset, offset + 4).readInt32BE(0)) {
                return parseInformationSection((indexBuffer[offset + 6] << 16) + (indexBuffer[offset + 5] << 8) + indexBuffer[offset + 4], indexBuffer[offset + 7]);
            }
        }

        return callback(null, invalidInputReturnValue);
    };

    validateIPAddress(ipAddress) ? iterate() : callback(new Error('Invalid IP Address'));
};

/**
 * Initialize from ip to geo location database path.
 *
 * @param {string} dataPath
 * @param {function} callback - Params: err.
 * @api public
 */

var initialize = function initialize(dataPath, callback) {
    localDataLoader.load(dataPath, function (err, result) {
        if (err || !result) {
            callback(err);
        } else {
            bufferTable = result;
            callback();
        }
    });
};

/**
 * Not initialize guard, return not initialized error.
 *
 * @param {function} func
 * @return {function}
 * @api private
 */

var returnErrorIfNotInitialized = function returnErrorIfNotInitialized(func) {
    return function () {
        for (var _len = arguments.length, argumentList = Array(_len), _key = 0; _key < _len; _key++) {
            argumentList[_key] = arguments[_key];
        }

        var callback = argumentList[argumentList.length - 1];

        !!bufferTable ? func.apply(undefined, argumentList) : callback(new Error('Not initialized error'));
    };
};

module.exports = {
    initialize: initialize,
    queryIPv4: returnErrorIfNotInitialized(queryIPv4),
    queryIPv6: returnErrorIfNotInitialized(queryIPv6),
    queryDomain: returnErrorIfNotInitialized(queryDomain)
};

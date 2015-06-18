var fs = require('fs')
  , path = require('path');


var headOffsetSectionBytes = 4;


var loadDatFormat = (dataFilePath, callback) => {
    let parseData = (buffer) => {
        let indexBufferEndSection = buffer.slice(0, headOffsetSectionBytes)
          , indexBufferEndOffset = indexBufferEndSection.readInt32BE(0);

        callback(null, {
            dataBuffer: buffer,
            indexBufferEndOffset: indexBufferEndOffset,
            indexBuffer: buffer.slice(headOffsetSectionBytes, indexBufferEndOffset)
        });
    };

    fs.readFile(dataFilePath, { encoding: null, flag: 'r' }, (err, buffer) => {
        err ? callback(err) : parseData(buffer);
    });
};

var loadDatxFormat = (dataFilePath, callback) => {
    callback(new Error('datx data format not support'));
};

var load = (dataFilePath, callback) => {
    let normalizedDataFilePath = path.normalize(dataFilePath)
      , extension = path.extname(normalizedDataFilePath);

    switch(extension) {
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
'use strict';

var fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    rewire = require('rewire');

var testDataFilePath = path.join(__dirname, '..', '17monipdb.dat'),
    testDataFileExist = false;

try {
    fs.closeSync(fs.openSync(testDataFilePath, 'r'));
    testDataFileExist = true;
} catch (err) {}

describe('IP to Geo Location - Local Data Loader', function () {
    it('should should throw error when file extension is neither .dat or .datx', function (done) {
        var localDataLoader = rewire('./local.data.loader.js');

        localDataLoader.load('/path/to/local/data/file.ext', function (err) {
            expect(err).to.be.a('Error');
            done();
        });
    });

    it('should should raise not support error when given .datx file', function (done) {
        var localDataLoader = rewire('./local.data.loader.js');

        localDataLoader.load('/path/to/local/data/file.datx', function (err) {
            expect(err).to.be.a('Error');
            done();
        });
    });

    testDataFileExist && it('should return parsed section table when given .dat file', function (done) {
        var localDataLoader = rewire('./local.data.loader.js');

        localDataLoader.load(testDataFilePath, function (err, sectionTable) {
            expect(err).to.be.not.an('Error');
            expect(sectionTable).to.have.all.keys(['dataBuffer', 'indexBuffer', 'indexBufferEndOffset']);
            done();
        });
    });

    testDataFileExist || it('should return parsed section table when given .dat file');
});

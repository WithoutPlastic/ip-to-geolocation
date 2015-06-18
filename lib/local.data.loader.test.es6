var fs = require('fs')
  , path = require('path')
  , expect = require('chai').expect
  , rewire = require('rewire');


var testDataFilePath = path.join(__dirname, '..', '17monipdb.dat')
  , testDataFileExist = false;


try {
    fs.closeSync(fs.openSync(testDataFilePath, 'r'));
    testDataFileExist = true;
} catch(err) {}


describe('IP to Geo Location - Local Data Loader', () => {
    it('should should throw error when file extension is neither .dat or .datx', (done) => {
        let localDataLoader = rewire('./local.data.loader.js');

        localDataLoader.load('/path/to/local/data/file.ext', (err) => {
            expect(err).to.be.a('Error');
            done();
        });
    });

    it('should should raise not support error when given .datx file', (done) => {
        let localDataLoader = rewire('./local.data.loader.js');

        localDataLoader.load('/path/to/local/data/file.datx', (err) => {
            expect(err).to.be.a('Error');
            done();
        });
    });

    testDataFileExist && it('should return parsed section table when given .dat file', (done) => {
        let localDataLoader = rewire('./local.data.loader.js');

        localDataLoader.load(testDataFilePath, (err, sectionTable) => {
            expect(err).to.be.not.an('Error');
            expect(sectionTable).to.have.all.keys(['dataBuffer', 'indexBuffer', 'indexBufferEndOffset']);
            done();
        });
    });

    testDataFileExist || it('should return parsed section table when given .dat file');
});

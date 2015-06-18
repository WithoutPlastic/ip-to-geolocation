var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , expect = require('chai').expect
  , rewire = require('rewire');


var asyncParallelLimit = 4
  , testDataFilePath = path.join(__dirname, '..', '17monipdb.dat')
  , testDataFileExist = false;


try {
    fs.closeSync(fs.openSync(testDataFilePath, 'r'));
    testDataFileExist = true;
} catch(err) {}



describe('IP to Geo Location - Controller', () => {
    describe('Initialization', () => {
        it('should call loader method load when called initialize', (done) => {
            let called = false
              , controller = rewire('./controller.js');

            controller.__with__({
                localDataLoader: {
                    load: (path, callback) => {
                        called = true;
                        callback();
                    }
                }
            })(() => {
                controller.initialize('/path/to/local/data/file', () => {
                    expect(called).to.be.true;
                    done();
                });
            });
        });
    });

    describe('Query IPv4', () => {
        it('should return error if query before initialization done', (done) => {
            let controller = rewire('./controller.js');

            controller.queryIPv4('8.8.8.8', (err) => {
                expect(err).to.be.a('Error');
                done();
            });
        });

        it('should return illegal input error when given illegal ipv4 address', (done) => {
            let controller = rewire('./controller.js');

            controller.__with__({ localDataLoader: { load: (path, callback) => callback() } })(() => {
                controller.initialize('/path/to/local/data/file', () => {
                    let taskList = ['x.x.x.x', '-1.0.0.0', '255.x.x.x', '1.1.1.1.1', '255.255.255.256']
                        .map((ipAddress) => (callback) => {
                            controller.queryIPv4(ipAddress, (err) => {
                                expect(err).to.be.a('Error');
                                callback();
                            });
                        });

                    async.parallelLimit(taskList, asyncParallelLimit, () => done());
                });
            });
        });

        testDataFileExist && it('should return correct information for common chinese ip address', (done) => {
            let controller = rewire('./controller.js');

            controller.initialize(testDataFilePath, (err) => {
                controller.queryIPv4('58.215.145.139', (err, geoLocation) => {
                    expect(err).not.to.be.an('Error');
                    expect(geoLocation).to.have.all.keys(['country', 'province', 'city', 'organization']);
                    done();
                });
            });
        });

        testDataFileExist || it('should return correct information for common chinese ip address');
    });

    describe('Query IPv6', () => {
        it('should return error if query before initialization donw', (done) => {
            let controller = rewire('./controller.js');

            controller.queryIPv6('8.8.8.8', (err) => {
                expect(err).to.be.a('Error');
                done();
            });
        });

        it('should return not support error when given valid ipv6 address', (done) => {
            let controller = rewire('./controller.js');

            controller.__with__({ localDataLoader: { load: (path, callback) => callback() } })(() => {
                controller.initialize('/path/to/local/data/file', () => {
                    controller.queryIPv6('2001:0db8:85a3:0042:1000:8a2e:0370:7334', (err) => {
                        expect(err).to.be.a('Error');
                        done();
                    });
                });
            });
        });
    });

    describe('Query Domain Name', () => {
        it('should return illegal input error when given illegal domain name', (done) => {
            let controller = rewire('./controller.js');

            controller.queryDomain('www.amazon.com', (err) => {
                expect(err).to.be.a('Error');
                done();
            });
        });

        it('should return not support error when given valid domain name', (done) => {
            let controller = rewire('./controller.js');

            controller.__with__({ localDataLoader: { load: (path, callback) => callback() } })(() => {
                controller.initialize('/path/to/local/data/file', () => {
                    controller.queryDomain('www.amazon.com', (err) => {
                        expect(err).to.be.a('Error');
                        done();
                    });
                });
            });
        });
    });
});

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

describe('IP to Geo Location - Controller', function () {
    describe('Initialization', function () {
        it('should call loader method load when called initialize', function (done) {
            var called = false,
                controller = rewire('./controller.js');

            controller.__with__({
                localDataLoader: {
                    load: function load(path, callback) {
                        called = true;
                        callback();
                    }
                }
            })(function () {
                controller.initialize('/path/to/local/data/file', function () {
                    expect(called).to.be['true'];
                    done();
                });
            });
        });
    });

    describe('Query IPv4', function () {
        it('should return error if query before initialization done', function (done) {
            var controller = rewire('./controller.js');

            expect(controller.queryIPv4('8.8.8.8')).to.be.a('Error');
            done();
        });

        it('should return illegal input error when given illegal ipv4 address', function (done) {
            var controller = rewire('./controller.js');

            controller.__with__({ localDataLoader: { load: function load(path, callback) {
                        return callback();
                    } } })(function () {
                controller.initialize('/path/to/local/data/file', function () {
                    expect(controller.queryIPv4('x.x.x.x')).to.be.a('Error');
                    expect(controller.queryIPv4('255.x.x.x')).to.be.a('Error');
                    expect(controller.queryIPv4('255.255.255.256')).to.be.a('Error');
                    expect(controller.queryIPv4('-1.0.0.0')).to.be.a('Error');
                    expect(controller.queryIPv4('1.1.1.1.1')).to.be.a('Error');
                    done();
                });
            });
        });

        testDataFileExist && it('should return correct information for common chinese ip address', function (done) {
            var controller = rewire('./controller.js');

            controller.initialize(testDataFilePath, function (err) {
                var result = controller.queryIPv4('58.215.145.139');

                expect(err).not.to.be.an('Error');
                expect(result).to.have.all.keys(['country', 'province', 'city', 'organization']);
                done();
            });
        });

        testDataFileExist || it('should return correct information for common chinese ip address');
    });

    describe('Query IPv6', function () {
        it('should return error if query before initialization donw', function (done) {
            var controller = rewire('./controller.js');

            expect(controller.queryIPv6('8.8.8.8')).to.be.a('Error');
            done();
        });

        it('should return not support error when given valid ipv6 address', function (done) {
            var controller = rewire('./controller.js');

            controller.__with__({ localDataLoader: { load: function load(path, callback) {
                        return callback();
                    } } })(function () {
                controller.initialize('/path/to/local/data/file', function () {
                    expect(controller.queryIPv6('2001:0db8:85a3:0042:1000:8a2e:0370:7334')).to.be.a('Error');
                    done();
                });
            });
        });
    });

    describe('Query Domain Name', function () {
        it('should return illegal input error when given illegal domain name', function (done) {
            var controller = rewire('./controller.js');

            expect(controller.queryDomain('www.amazon.com')).to.be.a('Error');
            done();
        });

        it('should return not support error when given valid domain name', function (done) {
            var controller = rewire('./controller.js');

            controller.__with__({ localDataLoader: { load: function load(path, callback) {
                        return callback();
                    } } })(function () {
                controller.initialize('/path/to/local/data/file', function () {
                    expect(controller.queryDomain('www.amazon.com')).to.be.a('Error');
                    done();
                });
            });
        });
    });
});
var localDataLoader = require('./local.data.loader.js');


const invalidInputReturnValue = 'N/A'
    , returnNotSupportError = () => new Error('Not support error');


var sectionTable = null;


var validateIPAddress = (ipAddress) => {
    let ipAddressSlice = ipAddress.trim().split('.')
      , ipAddressNumber = ipAddressSlice.map((slice) => parseInt(slice, 10))
      , validateIPSliceNumber = (n) => {
            return !isNaN(n) && (typeof n === 'number') && (0 <= n) && (n <= 255);
        };

    return (ipAddressNumber.length === 4) && ipAddressNumber.every(validateIPSliceNumber);
};

var queryIPv6 = returnNotSupportError;

var queryDomain = returnNotSupportError;

var queryIPv4 = (ipAddressString) => {
    let dataBuffer = sectionTable.dataBuffer
      , indexBuffer = sectionTable.indexBuffer
      , indexBufferEndOffset = sectionTable.indexBufferEndOffset
      , ipSliceList = ipAddressString.trim().split('.')
      , highSliceNumber = parseInt(ipSliceList[0], 10)
      , indexOffsetBytesL1 = highSliceNumber * 4
      , ipInInt32 = new Buffer(ipSliceList).readInt32BE(0)
      , parseInformationSection = (offset, length) => {
            let resultArray = dataBuffer.slice(
                indexBufferEndOffset + offset - 1024,
                indexBufferEndOffset + offset - 1024 + length
            ).toString('utf-8').split('\t');

            return (resultArray.length !== 4) ? invalidInputReturnValue : {
                country: resultArray[0],
                province: resultArray[1],
                city: resultArray[2],
                organization: resultArray[3]
            };
        }
      , iterate = () => {
            let offset = indexBuffer.slice(indexOffsetBytesL1, indexOffsetBytesL1 + 4).readInt32LE(0);

            for (offset = offset * 8 + 1024; offset < indexBufferEndOffset - 1024 - 4; offset += 8) {
                if (ipInInt32 <= indexBuffer.slice(offset, offset + 4).readInt32BE(0)) {
                    return parseInformationSection(
                        (indexBuffer[offset + 6] << 16) + (indexBuffer[offset + 5] << 8) + indexBuffer[offset + 4],
                        indexBuffer[offset + 7]
                    );
                }
            }

            return invalidInputReturnValue;
        };

    /*
    var iterate = (offsetBytes) => {
        let foo = sectionTable.ipL2IndexSection.slice(offsetBytes, offsetBytes + indexOffsetL2SepLengthInBytes)
          , consequent = (offset, length) => {
                let normalizedOffset = offset - 1024
                  , resultSlice = sectionTable.geoLocationIndexSection.slice(
                        normalizedOffset, normalizedOffset + length
                    );

                return resultSlice.toString('utf-8').split('\t');
            }
          , predicate = () => {
                if (ipInInt32 <= foo) {
                    consequent((foo[6] << 16) + (foo[5] << 8) + foo[4], foo[7]);
                } else {
                    iterate(offsetBytes + 8);
                }
            }
          , handleOutOfSection = () => {
                if (offsetBytes < sectionTable.ipL2IndexSection.length) {
                    predicate();
                } else {
                    return invalidInputReturnValue;
                }
            };

        handleOutOfSection();
    };
    */

    return validateIPAddress(ipAddressString) ? iterate() : new Error('Invalid IP Address');
};


var initialize = (dataPath, callback) => {
    localDataLoader.load(dataPath, (err, result) => {
        if (err || !result) {
            callback(err);
        } else {
            sectionTable = result;
            callback();
        }
    });
};


var returnErrorIfNotInitialized = (func) => {
    return (...argumentList) => {
        return !!sectionTable ? func(...argumentList) : new Error('Not initialized error');
    }
};



module.exports = {
    initialize: initialize,
    queryIPv4: returnErrorIfNotInitialized(queryIPv4),
    queryIPv6: returnErrorIfNotInitialized(queryIPv6),
    queryDomain: returnErrorIfNotInitialized(queryDomain)
};

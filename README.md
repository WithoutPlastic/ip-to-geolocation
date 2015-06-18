# ip-to-geolocation
A ip address to geolocation lib, query geolocation from im-memory database.

- In-memory ip to geolocation query.

## Install
Install from npm.

    npm install ip-to-geolocation

Download off-line ip-to-geolocation database.

    wget http://s.qdcdn.com/17mon/17monipdb.zip

Above is a free version provided by 17mon. Put it in your project directory.

## Usage
Load ip-to-geolocation module, initialize with local database path.

    var ipToGeoLocation = require('ip-to-geolocation');

    ipToGeoLocation.initialize('/path/to/local/ip/database');

Query with IPv4 address, return with dict with country, province, city, organization field.

    ipToGeoLocation.queryIPv4('8.8.8.8');
    // { country: 'Google', province: 'Google', city: '', organization: '' }

    ipToGeoLocation.queryIPv4('58.215.145.139');
    // { country: '中国', province: '江苏', city: '无锡', organization: '' }

## Supported Data Source
- 17mon from www.ipip.net, .dat format, free chinese version.

## Task List

- [ ] Add domain name support
- [ ] Add QQ wry ip database support
- [ ] Add http api support
- [ ] Add 17mon .datx data format support

## Bug && Issues
https://github.com/cesanta/mongoose/issues

## License
[MIT](http://opensource.org/licenses/MIT)
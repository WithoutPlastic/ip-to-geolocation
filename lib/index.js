'use strict';

var controller = require('./controller.js');

module.exports = {
    initialize: controller.initialize,
    queryIPv4: controller.queryIPv4,
    queryIPv6: controller.queryIPv6,
    queryDomain: controller.queryDomain
};

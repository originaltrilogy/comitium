// announcement controller

'use strict';

module.exports = {
  // All this controller does is serve as an alias for the topic controller
  // until the alias feature is added to citizen.
  handler: require('./topic').handler
};

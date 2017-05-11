'use strict';

require('core-js');

var _nodePlop = require('./node-plop');

var _nodePlop2 = _interopRequireDefault(_nodePlop);

var _doThePlop = require('./do-the-plop');

var _doThePlop2 = _interopRequireDefault(_doThePlop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Main node-plop module
 *
 * @param {string} plopfilePath - The absolute path to the plopfile we are interested in working with
 * @param {object} plopCfg - A config object to be passed into the plopfile when it's executed
 * @returns {object} the node-plop API for the plopfile requested
 */
// es2015 polyfill
module.exports = {
  nodePlop: _nodePlop2.default,
  doThePlop: _doThePlop2.default
};
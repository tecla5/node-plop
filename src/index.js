import 'core-js'; // es2015 polyfill
import nodePlop from './node-plop';
import doThePlop from './do-the-plop';

/**
 * Main node-plop module
 *
 * @param {string} plopfilePath - The absolute path to the plopfile we are interested in working with
 * @param {object} plopCfg - A config object to be passed into the plopfile when it's executed
 * @returns {object} the node-plop API for the plopfile requested
 */
module.exports = {
	nodePlop,
	doThePlop
};
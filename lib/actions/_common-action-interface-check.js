'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (action) {

	// it's not even an object, you fail!
	if (typeof action !== 'object') {
		return `Invalid action object: ${JSON.stringify(action)}`;
	}

	const path = action.path;


	if (typeof path !== 'string' || path.length === 0) {
		return `Invalid path "${path}"`;
	}

	return true;
};
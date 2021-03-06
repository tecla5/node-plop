'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _commonActionInterfaceCheck = require('./_common-action-interface-check');

var _commonActionInterfaceCheck2 = _interopRequireDefault(_commonActionInterfaceCheck);

var _commonActionAddFile = require('./_common-action-add-file');

var _commonActionAddFile2 = _interopRequireDefault(_commonActionAddFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _co2.default.wrap(function* (data, cfg, plop) {
	let opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	const interfaceTestResult = (0, _commonActionInterfaceCheck2.default)(cfg);
	if (interfaceTestResult !== true) {
		throw interfaceTestResult;
	}

	return yield (0, _commonActionAddFile2.default)(data, cfg, plop, opts);
});
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsPromiseProxy = require('../fs-promise-proxy');

var fspp = _interopRequireWildcard(_fsPromiseProxy);

var _commonActionInterfaceCheck = require('./_common-action-interface-check');

var _commonActionInterfaceCheck2 = _interopRequireDefault(_commonActionInterfaceCheck);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// optionally add a 4th opts = {} argument
exports.default = _co2.default.wrap(function* (data, cfg, plop) {
	const interfaceTestResult = (0, _commonActionInterfaceCheck2.default)(cfg);
	if (interfaceTestResult !== true) {
		throw interfaceTestResult;
	}

	// if not already an absolute path, make an absolute path from the basePath (plopfile location)
	const makeTmplPath = p => _path2.default.resolve(plop.getPlopfilePath(), p);
	const makeDestPath = p => _path2.default.resolve(plop.getDestBasePath(), p);

	var template = cfg.template;

	const fileDestPath = makeDestPath(plop.renderString(cfg.path || '', data));

	try {
		if (cfg.templateFile) {
			template = yield fspp.readFile(makeTmplPath(cfg.templateFile));
		}
		if (template == null) {
			template = '';
		}

		// check path
		const pathExists = yield fspp.fileExists(fileDestPath);

		if (!pathExists) {
			throw 'File does not exists';
		} else {
			var fileData = yield fspp.readFile(fileDestPath);
			fileData = fileData.replace(cfg.pattern, plop.renderString(template, data));
			yield fspp.writeFile(fileDestPath, fileData);
		}

		// return the modified file path (relative to the destination path)
		return fileDestPath.replace(_path2.default.resolve(plop.getDestBasePath()), '');
	} catch (err) {
		if (typeof err === 'string') {
			throw err;
		} else {
			throw err.message || JSON.stringify(err);
		}
	}
});
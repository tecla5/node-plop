'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = addFile;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsPromiseProxy = require('../fs-promise-proxy');

var fspp = _interopRequireWildcard(_fsPromiseProxy);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function* addFile(data, cfg, plop) {
	let opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	// if not already an absolute path, make an absolute path from the basePath (plopfile location)
	const makeTmplPath = p => _path2.default.resolve(plop.getPlopfilePath(), p);
	const makeDestPath = p => _path2.default.resolve(plop.getDestBasePath(), p);

	var template = cfg.template;

	var tplData = Object.assign(opts, cfg, data);
	var destPath = plop.renderString(cfg.path || '', tplData);
	const fileDestPath = makeDestPath(destPath);

	try {
		if (cfg.templateFile) {
			let tplPath = plop.renderString(cfg.templateFile, data);
			template = yield fspp.readFile(makeTmplPath(tplPath));
		}
		if (template == null) {
			template = '';
		}

		// check path
		const pathExists = yield fspp.fileExists(fileDestPath);

		if (pathExists) {
			throw 'File already exists';
		} else {
			yield fspp.makeDir(_path2.default.dirname(fileDestPath));
			var templateResult = plop.renderString(template, data);
			yield fspp.writeFile(fileDestPath, templateResult);
		}

		// return the added file path (relative to the destination path)
		return fileDestPath.replace(_path2.default.resolve(plop.getDestBasePath()), '');
	} catch (err) {
		if (typeof err === 'string') {
			throw err;
		} else {
			throw err.message || JSON.stringify(err);
		}
	}
}
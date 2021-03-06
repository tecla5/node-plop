'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _commonActionInterfaceCheck = require('./_common-action-interface-check');

var _commonActionInterfaceCheck2 = _interopRequireDefault(_commonActionInterfaceCheck);

var _commonActionAddFile = require('./_common-action-add-file');

var _commonActionAddFile2 = _interopRequireDefault(_commonActionAddFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _co2.default.wrap(function* (data, cfg, plop) {
	let opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	const cfgWithCommonInterface = Object.assign({}, cfg, {
		path: cfg.destination
	});
	const interfaceTestResult = (0, _commonActionInterfaceCheck2.default)(cfgWithCommonInterface);
	if (interfaceTestResult !== true) {
		throw interfaceTestResult;
	}

	const templateFiles = resolveTemplateFiles(cfg.templateFiles, plop);
	const filesAdded = [];
	for (let templateFile of templateFiles) {
		const fileCfg = Object.assign({}, cfg, {
			path: resolvePath(cfg.destination, templateFile, cfg.base),
			templateFile: templateFile
		});

		const addedPath = yield (0, _commonActionAddFile2.default)(data, fileCfg, plop, opts);
		filesAdded.push(addedPath);
	}

	return `${filesAdded.length} files added\n\t - ${filesAdded.join('\n\t - ')}`;
});


function resolveTemplateFiles(templateFilesGlob, plop) {
	return _globby2.default.sync([templateFilesGlob], {
		cwd: plop.getPlopfilePath()
	}).filter(isFile);
}

function isFile(file) {
	const fileParts = file.split(_path2.default.sep);
	const lastFilePart = fileParts[fileParts.length - 1];
	const hasExtension = !!lastFilePart.split('.')[1];

	return hasExtension;
}

function resolvePath(destination, file, rootPath) {
	return _path2.default.join(destination, dropFileRootPath(file, rootPath));
}

function dropFileRootPath(file, rootPath) {
	return rootPath ? file.replace(rootPath, '') : dropFileRootFolder(file);
}

function dropFileRootFolder(file) {
	const fileParts = file.split(_path2.default.sep);
	fileParts.shift();

	return fileParts.join(_path2.default.sep);
}
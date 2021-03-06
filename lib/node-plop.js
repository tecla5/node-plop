'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _resolve = require('resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _bakedInHelpers = require('./baked-in-helpers');

var _bakedInHelpers2 = _interopRequireDefault(_bakedInHelpers);

var _generatorRunner = require('./generator-runner');

var _generatorRunner2 = _interopRequireDefault(_generatorRunner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function nodePlop() {
	let plopfilePath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	let plopCfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (typeof plopfilePath === 'object') {
		plopCfg = plopfilePath;
	}

	var pkgJson = {};
	var defaultInclude = {
		generators: true
	};

	var _plopCfg = plopCfg;
	const destBasePath = _plopCfg.destBasePath;

	const generators = {};
	const partials = {};
	const actionTypes = {};
	const helpers = Object.assign({
		pkg: propertyPath => (0, _lodash2.default)(pkgJson, propertyPath, '')
	}, _bakedInHelpers2.default);
	const baseHelpers = Object.keys(helpers);

	const setPrompt = _inquirer2.default.registerPrompt;
	const setHelper = (name, fn) => {
		helpers[name] = fn;
	};
	const setPartial = (name, str) => {
		partials[name] = str;
	};
	const setActionType = (name, fn) => {
		actionTypes[name] = fn;
	};

	function renderString(template, data) {
		Object.keys(helpers).forEach(h => _handlebars2.default.registerHelper(h, helpers[h]));
		Object.keys(partials).forEach(p => _handlebars2.default.registerPartial(p, partials[p]));
		return _handlebars2.default.compile(template)(data);
	}

	const getHelper = name => helpers[name];
	const getPartial = name => partials[name];
	const getActionType = name => actionTypes[name];
	const getGenerator = name => generators[name];

	function setGenerator() {
		let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
		let config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		// if no name is provided, use a default
		name = name || `generator-${Object.keys(generators).length + 1}`;

		// add the generator to this context
		generators[name] = Object.assign(config, {
			name: name,
			basePath: plopfilePath
		});

		return generators[name];
	}

	const getHelperList = () => Object.keys(helpers).filter(h => !baseHelpers.includes(h));
	const getPartialList = () => Object.keys(partials);
	const getActionTypeList = () => Object.keys(actionTypes);

	function getGeneratorList() {
		return Object.keys(generators).map(function (name) {
			const description = generators[name].description;

			return {
				name: name,
				description: description
			};
		});
	}

	const setDefaultInclude = inc => defaultInclude = inc;
	const getDefaultInclude = () => defaultInclude;
	const getDestBasePath = () => {
		return destBasePath || plopCfg.rootPath || plopfilePath;
	};
	const getPlopfilePath = () => {
		return typeof plopfilePath === 'string' ? plopfilePath : plopfilePath.templatesPath;
	};

	const setPlopfilePath = filePath => {
		plopfilePath = _path2.default.dirname(filePath);
	};

	function load(targets) {
		let loadCfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		let includeOverride = arguments[2];

		if (typeof targets === 'string') {
			targets = [targets];
		}
		const config = Object.assign({
			destBasePath: getDestBasePath()
		}, loadCfg);

		targets.forEach(function (target) {
			const targetPath = _resolve2.default.sync(target, {
				basedir: getPlopfilePath()
			});
			const proxy = nodePlop(targetPath, config);
			const proxyDefaultInclude = proxy.getDefaultInclude() || {};
			const includeCfg = includeOverride || proxyDefaultInclude;
			const include = Object.assign({
				generators: false,
				helpers: false,
				partials: false,
				actionTypes: false
			}, includeCfg);

			const genNameList = proxy.getGeneratorList().map(g => g.name);
			loadAsset(genNameList, include.generators, setGenerator, proxyName => ({
				proxyName: proxyName,
				proxy: proxy
			}));
			loadAsset(proxy.getPartialList(), include.partials, setPartial, proxy.getPartial);
			loadAsset(proxy.getHelperList(), include.helpers, setHelper, proxy.getHelper);
			loadAsset(proxy.getActionTypeList(), include.actionTypes, setActionType, proxy.getActionType);
		});
	}

	function loadAsset(nameList, include, addFunc, getFunc) {
		var incArr;
		if (include === true) {
			incArr = nameList;
		}
		if (include instanceof Array) {
			incArr = include.filter(n => typeof n === 'string');
		}
		if (incArr != null) {
			include = incArr.reduce(function (inc, name) {
				inc[name] = name;
				return inc;
			}, {});
		}

		if (include instanceof Object) {
			Object.keys(include).forEach(i => addFunc(include[i], getFunc(i)));
		}
	}

	function loadPackageJson() {
		// look for a package.json file to use for the "pkg" helper
		try {
			pkgJson = require(_path2.default.join(getDestBasePath(), 'package.json'));
		} catch (error) {
			pkgJson = {};
		}
	}

	const runGenerator = require('./do-the-plop');

	/////////
	// the API that is exposed to the plopfile when it is executed
	// it differs from the nodePlopApi in that it does not include the
	// generator runner methods
	//
	const plopfileApi = {
		runGenerator: runGenerator,
		setPrompt: setPrompt,
		renderString: renderString,
		inquirer: _inquirer2.default,
		handlebars: _handlebars2.default,
		setGenerator: setGenerator,
		getGenerator: getGenerator,
		getGeneratorList: getGeneratorList,
		setPlopfilePath: setPlopfilePath,
		getPlopfilePath: getPlopfilePath,
		getDestBasePath: getDestBasePath,
		load: load,
		setPartial: setPartial,
		getPartialList: getPartialList,
		getPartial: getPartial,
		setHelper: setHelper,
		getHelperList: getHelperList,
		getHelper: getHelper,
		setActionType: setActionType,
		getActionTypeList: getActionTypeList,
		getActionType: getActionType,
		setDefaultInclude: setDefaultInclude,
		getDefaultInclude: getDefaultInclude,
		// for backward compatibility
		addPrompt: setPrompt,
		addPartial: setPartial,
		addHelper: setHelper,
		addActionType: setActionType
	};

	// the runner for this instance of the nodePlop api
	const runner = (0, _generatorRunner2.default)(plopfileApi);
	let nodePlopApi = Object.assign({}, plopfileApi, {
		getGenerator: function getGenerator(name) {
			var generator = plopfileApi.getGenerator(name);

			// if this generator was loaded from an external plopfile, proxy the
			// generator request through to the external plop instance
			if (generator.proxy) {
				return generator.proxy.getGenerator(generator.proxyName);
			}
			return Object.assign({}, generator, {
				runListActions: (data, opts) => runner.runGeneratorListActions(generator, data, opts),
				runActions: (data, opts) => runner.runGeneratorActions(generator, data, opts),
				runInputs: () => runner.runGeneratorInputs(generator),
				runPrompts: () => runner.runGeneratorPrompts(generator)
			});
		},
		setGenerator: function setGenerator(name, config) {
			const g = plopfileApi.setGenerator(name, config);
			return this.getGenerator(g.name);
		}
	});

	if (typeof plopfilePath === 'string') {
		if (plopfilePath) {
			plopfilePath = _path2.default.resolve(plopfilePath);
			const plopFileName = _path2.default.basename(plopfilePath);
			setPlopfilePath(plopfilePath);
			loadPackageJson();
			var fullPlopFilePath = _path2.default.join(plopfilePath, plopFileName);
			require(fullPlopFilePath)(plopfileApi, plopCfg);
		} else {
			setPlopfilePath(process.cwd());
			loadPackageJson();
		}
	}
	if (typeof plopfilePath === 'object') {
		plopfileApi.setGenerator('default', plopfilePath);
	}

	return nodePlopApi;
}

exports.default = nodePlop;
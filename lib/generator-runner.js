'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (plopfileApi) {
	var abort;

	// triggers inquirer with the correct prompts for this generator
	// returns a promise that resolves with the user's answers
	const runGeneratorPrompts = _co2.default.wrap(function* (genObject) {
		if (genObject.prompts == null) {
			error(`${genObject.name} has no prompts`, {
				genObject: genObject
			});
		}
		return yield plopfileApi.inquirer.prompt(genObject.prompts);
	});

	const runGeneratorInputs = _co2.default.wrap(function* (genObject) {
		if (genObject.inputs == null) {
			error(`${genObject.name} has no inputs`, {
				genObject: genObject
			});
		}
		var yielder = genObject.inputs(genObject);
		if (!yielder.then) {
			yielder = new Promise(resolve => {
				resolve(yielder);
			});
		}
		return yield yielder;
	});

	function* generate(genObject, data) {
		let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		opts = opts || {};
		opts.createLog = (0, _logger.logger)(opts);
		const log = opts.createLog('generate');

		var changes = []; // array of changed made by the actions
		var failures = []; // array of actions that failed
		let actions = [];
		let actionType;
		var allActions = genObject.allActions; // the list of actions to execute

		if (opts && opts.actions) {
			actionType = opts.actions;
			actions = allActions[actionType];
		}

		log({
			allActions: allActions,
			actions: actions,
			actionType: actionType
		});

		const customActionTypes = getCustomActionTypes();
		const buildInActions = {
			add: _add2.default,
			addMany: _addMany2.default,
			modify: _modify2.default
		};
		const actionTypes = Object.assign({}, customActionTypes, buildInActions);
		log({
			actionTypes: actionTypes
		});

		abort = false;

		// if action is a function, run it to get our array of actions
		if (typeof actions === 'function') {
			actions = actions(data, opts);
		}

		// if actions are not defined... we cannot proceed.
		if (actions == null) {
			error(`${genObject.name} has no actions (null)`);
		}

		// if actions are not an array, invalid!
		if (!(actions instanceof Array)) {
			error(`${genObject.name} has invalid actions ${typeof actions}`, {
				actions: actions
			});
		}

		for (let _ref of actions.entries()) {
			var _ref2 = _slicedToArray(_ref, 2);

			let actionIdx = _ref2[0];
			let action = _ref2[1];

			// bail out if a previous action aborted
			if (abort) {
				failures.push({
					type: action.type || '',
					path: action.path || '',
					error: 'Aborted due to previous action failure'
				});
				continue;
			}

			const actionIsFunction = typeof action === 'function';
			const actionCfg = actionIsFunction ? {} : action;
			const actionLogic = actionIsFunction ? action : actionTypes[actionCfg.type];

			if (typeof actionLogic !== 'function') {
				if (actionCfg.abortOnFail !== false) {
					abort = true;
				}
				failures.push({
					type: action.type || '',
					path: action.path || '',
					error: `Invalid action (#${actionIdx + 1})`
				});
				continue;
			}

			try {
				const actionResult = yield executeActionLogic(actionLogic, actionCfg, data, opts);
				changes.push(actionResult);
			} catch (failure) {
				failures.push(failure);
			}
		}

		return {
			changes: changes,
			failures: failures
		};
	}

	// Run the actions for this generator
	const runGeneratorActions = _co2.default.wrap(generate);

	const runGeneratorListActions = _co2.default.wrap(function* (genObject, data) {
		let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		let results = data.map(_co2.default.wrap(function* (item) {
			let result = yield generate(genObject, item, opts);
			return result;
		}));
		let allResults = yield Promise.all(results);
		return yield allResults.reduce((acc, val) => {
			Object.assign(acc, val);
			return acc;
		}, {});
	});

	// handle action logic
	const executeActionLogic = _co2.default.wrap(function* (action, cfg, data) {
		let opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

		const failure = makeErrorLogger(cfg.type || 'function', '', cfg.abortOnFail);

		// convert any returned data into a promise to
		// return and wait on
		const actionResult = action(data, cfg, plopfileApi, opts);
		return yield Promise.resolve(actionResult).then(
		// show the resolved value in the console
		result => ({
			type: cfg.type || 'function',
			path: _colors2.default.blue(result.toString()),
			vfs: actionResult
		}),
		// a rejected promise is treated as a failure
		function (err) {
			throw failure(err.message || err.toString());
		});
	});

	// request the list of custom actions from the plopfile
	function getCustomActionTypes() {
		return plopfileApi.getActionTypeList().reduce(function (types, name) {
			types[name] = plopfileApi.getActionType(name);
			return types;
		}, {});
	}

	// provide a function to handle action errors in a uniform way
	function makeErrorLogger(type, path, abortOnFail) {
		return function (error) {
			if (abortOnFail !== false) {
				abort = true;
			}
			return {
				type: type,
				path: path,
				error: error
			};
		};
	}

	return {
		runGeneratorActions: runGeneratorActions,
		runGeneratorListActions: runGeneratorListActions,
		runGeneratorInputs: runGeneratorInputs,
		runGeneratorPrompts: runGeneratorPrompts
	};
};

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _add = require('./actions/add');

var _add2 = _interopRequireDefault(_add);

var _addMany = require('./actions/addMany');

var _addMany2 = _interopRequireDefault(_addMany);

var _modify = require('./actions/modify');

var _modify2 = _interopRequireDefault(_modify);

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function error(msg, data) {
	console.error(msg, data);
	throw Error(msg);
}
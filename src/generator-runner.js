'use strict';

import co from 'co';
import colors from 'colors';
import add from './actions/add';
import addMany from './actions/addMany';
import modify from './actions/modify';

export default function (plopfileApi) {
	var abort;

	// triggers inquirer with the correct prompts for this generator
	// returns a promise that resolves with the user's answers
	const runGeneratorPrompts = co.wrap(function* (genObject) {
		if (genObject.prompts == null) {
			throw Error(`${genObject.name} has no prompts`);
		}
		return yield plopfileApi.inquirer.prompt(genObject.prompts);
	});

	const runGeneratorInputs = co.wrap(function* (genObject) {
		if (genObject.inputs == null) {
			throw Error(`${genObject.name} has no inputs`);
		}
		var yielder = genObject.inputs(genObject);
		if (!yielder.then) {
			yielder = new Promise(resolve => {
				resolve(yielder);
			});
		}
		return yield yielder;
	});

	function* generate(genObject, data, opts = {}) {
		var changes = []; // array of changed made by the actions
		var failures = []; // array of actions that failed
		var {
			actions
		} = genObject; // the list of actions to execute
		if (opts && opts.actions) {
			actions = actions[opts.actions];
		}
		const customActionTypes = getCustomActionTypes();
		const buildInActions = {
			add,
			addMany,
			modify
		};
		const actionTypes = Object.assign({}, customActionTypes, buildInActions);

		abort = false;

		// if action is a function, run it to get our array of actions
		if (typeof actions === 'function') {
			actions = actions(data, opts);
		}

		// if actions are not defined... we cannot proceed.
		if (actions == null) {
			throw Error(`${genObject.name} has no actions`);
		}

		// if actions are not an array, invalid!
		if (!(actions instanceof Array)) {
			throw Error(`${genObject.name} has invalid actions`);
		}

		for (let [actionIdx, action] of actions.entries()) {
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
			const actionCfg = (actionIsFunction ? {} : action);
			const actionLogic = (actionIsFunction ? action : actionTypes[actionCfg.type]);

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
			changes,
			failures
		};
	}

	// Run the actions for this generator
	const runGeneratorActions = co.wrap(generate);

	const runGeneratorListActions = co.wrap(function* (genObject, data, opts = {}) {
		// TODO: async loop
		let results = data.map(co.wrap(function* (item) {
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
	const executeActionLogic = co.wrap(function* (action, cfg, data, opts = {}) {
		const failure = makeErrorLogger(cfg.type || 'function', '', cfg.abortOnFail);

		// convert any returned data into a promise to
		// return and wait on
		return yield Promise.resolve(action(data, cfg, plopfileApi, opts)).then(
			// show the resolved value in the console
			result => ({
				type: cfg.type || 'function',
				path: colors.blue(result.toString())
			}),
			// a rejected promise is treated as a failure
			function (err) {
				throw failure(err.message || err.toString());
			}
		);
	});

	// request the list of custom actions from the plopfile
	function getCustomActionTypes() {
		return plopfileApi.getActionTypeList()
			.reduce(function (types, name) {
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
				type,
				path,
				error
			};
		};
	}

	return {
		runGeneratorActions,
		runGeneratorListActions,
		runGeneratorInputs,
		runGeneratorPrompts
	};
}
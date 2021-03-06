'use strict';

var _logger = require('./logger');

var chalk = require('chalk');


/////
// everybody to the plop!
//
module.exports = function doThePlop(generator, opts, cb) {
  opts = opts || {};
  opts.createLog = (0, _logger.logger)(opts);
  const log = opts.createLog('doThePlop');
  generator.runInputs().then(inputs => {
    log('generator', {
      inputs: inputs
    });

    var actionExecName = Array.isArray(inputs) ? 'runListActions' : 'runActions';
    log({
      actionExecName: actionExecName
    });

    if (inputs.list || inputs.item) {
      log('doing list and/or item');
      var inputOpts = Object.assign({}, inputs);
      delete inputOpts.item;
      delete inputOpts.list;

      var listOpts = Object.assign({}, opts, inputOpts, {
        actions: 'list'
      });
      var itemOpts = Object.assign({}, opts, inputOpts, {
        actions: 'item'
      });
      log({
        itemOpts: itemOpts,
        listOpts: listOpts
      });

      var listResults = generator.runListActions(inputs.list, listOpts);
      var itemResults = generator.runActions(inputs.item, itemOpts);
      var allResults = [listResults, itemResults].filter(res => res !== null);

      log({
        listResults: listResults,
        itemResults: itemResults,
        allResults: allResults
      });
      return Promise.all(allResults);
    }
    var actionExec = generator[actionExecName];
    return actionExec(inputs);
  }).then(function (result) {
    if (Array.isArray(result)) {
      result = result.reduce((acc, val) => {
        acc.changes = acc.changes.concat(val.changes);
        acc.failures = acc.failures.concat(val.failures);
        return acc;
      }, {
        changes: [],
        failures: []
      });
    }
    result.changes.forEach(function (line) {
      console.log(chalk.green('[SUCCESS]'), line.type, line.path);
    });
    result.failures.forEach(function (line) {
      var logs = [chalk.red('[FAILED]')];
      if (line.type) {
        logs.push(line.type);
      }
      if (line.path) {
        logs.push(line.path);
      }

      var error = line.error || line.message;
      logs.push(chalk.red(error));

      console.log.apply(console, logs);
    });
    if (cb) {
      cb({
        result: result
      });
    }
  }).catch(function (err) {
    console.error(chalk.red('[ERROR]'), err.message, err.stack);
    cb({
      err: err
    });
  });
};
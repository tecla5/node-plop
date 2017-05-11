var chalk = require('chalk')

/////
// everybody to the plop!
//
module.exports = function doThePlop(generator, opts = {}, cb) {
  generator.runInputs().then(inputs => {
      var actionExecName = Array.isArray(inputs) ? 'runListActions' : 'runActions'
      if (inputs.list && inputs.item) {
        var inputOpts = Object.assign({}, inputs)
        delete inputOpts.item
        delete inputOpts.list

        var listOpts = Object.assign({}, opts, inputOpts, {
          actions: 'list'
        })
        var itemOpts = Object.assign({}, opts, inputOpts, {
          actions: 'item'
        })
        var listResults = generator.runListActions(inputs.list, listOpts)
        var itemResults = generator.runActions(inputs.item, itemOpts)

        return Promise.all([listResults, itemResults]);
      }
      var actionExec = generator[actionExecName]
      return actionExec(inputs)
    })
    .then(function (result) {
      if (Array.isArray(result)) {
        result = result.reduce((acc, val) => {
          acc.changes = acc.changes.concat(val.changes)
          acc.failures = acc.failures.concat(val.failures)
          return acc
        }, {
          changes: [],
          failures: []
        })
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
        cb(result)
      }
    })
    .catch(function (err) {
      console.error(chalk.red('[ERROR]'), err.message, err.stack);
      process.exit(1);
    });
}
Node-Plop
======

[![CircleCI](https://circleci.com/gh/amwmedia/node-plop/tree/master.svg?style=svg)](https://circleci.com/gh/amwmedia/node-plop/tree/master)

This is an early publication of the plop core logic being removed from the CLI tool. Main purpose for this is to make it easier for others to automate code generation through processes and tools OTHER than the command line. This also makes it easier to test the code functionality of PLOP without needing to test via the CLI interface.

Once I feel comfortable that this code functions as it should. I'll be driving the plop CLI tool using node-plop.

``` javascript
const nodePlop = require('node-plop');
// load an instance of plop from a plopfile
const plop = nodePlop(`./path/to/plopfile.js`);
// get a generator by name
const basicAdd = plop.getGenerator('basic-add');

// run all the generator actions using the data specified
basicAdd.runActions({name: 'this is a test'}, {
  logging: true
}).then(function (results) {
  // do something after the actions have run
});
```

### The promised way

```js
let results = await basicAdd.runActions({name: 'this is a test'}, {
  logging: true
})
console.log(results)
```

### Run as library

```js
module.exports = async function run(obj, opts = {}) {
  let data = Object.assign(obj.data, {
    root: opts.root || opts.rootPath || 'app',
    fsys: vfs(opts)
  })

  // can we pass empty action list?
  let actions = {
    list: [],
    // list: (_actions.file.list || []).concat(customActions(data, opts)),
    item: _actions.vfs.item
  }

  console.log({
    actions
  })

  // we need to pass data as inputs?
  let plopConfig = config(data, actions)
  console.log({
    plopConfig
  })

  let plop = nodePlop(plopConfig)
  console.log({
    plop
  })

  // We declare a new generator called "default"
  let generator = plop.setGenerator('default', plopConfig)

  function extractVfs(change) {
    return change.vfs
  }

  console.log({
    doThePlop,
    generator
  });

  let results = await doThePlop(generator, {
    logging: true
  })
  console.log('result', results)
  console.log('first change', result.changes[0].vfs)
  let fileChanges = result.changes.map(extractVfs)
  return fileChanges
}
```
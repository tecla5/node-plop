"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = logger;
function logger(opts) {
  let io = opts.io || console;
  return function (name) {
    return function () {
      if (opts.logging) {
        for (var _len = arguments.length, msgs = Array(_len), _key = 0; _key < _len; _key++) {
          msgs[_key] = arguments[_key];
        }

        io.log.apply(io, [name].concat(msgs));
      }
    };
  };
}
export function logger(opts) {
  let io = opts.io || console
  return function (name) {
    return function (...msgs) {
      if (opts.logging) {
        io.log(name, ...msgs)
      }
    }
  }
}
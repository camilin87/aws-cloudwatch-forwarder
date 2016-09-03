var readline = require('readline');
var Rx = require('rx');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var lines = Rx.Observable.fromEvent(rl, 'line')
    .takeUntil(Rx.Observable.fromEvent(rl, 'close'))
    .subscribe(
        (line) => console.log("FF: " + line),
        err => console.log("FF_Error: %s", err),
        () => console.log("FF_COMPLETED")
    );

console.log("FF_AWS_REGION", process.env.AWS_REGION)

var readline = require('readline');
var Rx = require('rx');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var lines = Rx.Observable.fromEvent(rl, 'line')
    .takeUntil(Rx.Observable.fromEvent(rl, 'close'))
    .bufferCount(10)
    .bufferTime(1000)
    .skipWhile((b) => (b || []).length === 0);

lines
    .subscribe(
        (lines) => console.log("FF: " + lines.map(l => l.toString()).join(",").substr(0, 20)),
        err => console.log("FF_Error: %s", err),
        () => console.log("FF_COMPLETED")
    );

console.log("FF_AWS_REGION", process.env.AWS_REGION)

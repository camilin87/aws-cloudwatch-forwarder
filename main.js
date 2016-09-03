var readline = require('readline');
var Rx = require('rx');
var promise = require("the-promise-factory");

var Lock = require('lock')
var lock = Lock();

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

lines.subscribe(
    (lines) => {
        // lock("aws-transmission", (release) => {
            // promise.create((fulfill, reject) => {
                console.log("FF: " + lines.map(l => l.toString()).join(",").substr(0, 20))
        //         fulfill();
        //     }).then(() => {
        //         release();
        //     })
        // })
    },
    err => console.log("FF_Error: %s", err),
    () => console.log("FF_COMPLETED")
);

console.log("FF_AWS_REGION", process.env.AWS_REGION)

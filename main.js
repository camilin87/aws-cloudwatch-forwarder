var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var isListening = true;
var lines = [];

rl.on("line", l => lines.push(l));
rl.on("close", () => isListening = false);

console.log("FF_AWS_REGION", process.env.AWS_REGION)

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    console.log("FF: " + line);
})

rl.on('close', function(line){
    console.log("FF_CLOSE");
})

console.log("FF_AWS_REGION", process.env.AWS_REGION)

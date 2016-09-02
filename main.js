var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    console.log("C: " + line);
})

rl.on('close', function(line){
    console.log("C_CLOSE");
})

console.log("C_AWS_REGION", process.env.AWS_REGION)

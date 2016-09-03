var readline = require("readline");
var promise = require("the-promise-factory");

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


initAWS()
    .then((awsInfo) => {

        sendLogs(awsInfo)
            .then(() => {
                console.log("FF_COMPLETED");
                process.exit(0);
            }, (err) => {
                console.log(err, err.stack);
                process.exit(1);
            });

    }, (err) => {
        console.log(err, err.stack);
        process.exit(1);
    })


function initAWS(){
    return promise.create((fulfill, reject) => {
        //TODO: real implementation

        setTimeout(() => {
            fulfill({
                logParameters: {
                    logGroupName: "logGroupName",
                    logStreamName: "logStreamName",
                    sequenceToken: "000001"
                },
                logWriter: {
                    putLogEvents: () => {}
                }
            })
        }, 1000);
    });
}

function sendLogs(awsInfo){
    return promise.create((fulfill, reject) => {
        if (shouldStopSendingLogs()){
            fulfill();
        }

        sendAvailableLogLines(awsInfo)
            .then((updatedAwsInfo) => {
                sendLogs(updatedAwsInfo).then(fulfill, reject);
            }, reject);
    });
}

function shouldStopSendingLogs(){
    return isListening === false && lines.length === 0;
}

function sendAvailableLogLines(awsInfo){
    return promise.create((fulfill, reject) => {
        if (lines.length === 0){

            console.log("X".repeat(30));

            setTimeout(() => {
                fulfill(awsInfo);
            }, 2000);

            return;
        }

        var linesToSend = [];

        if (lines.length < 10){
            linesToSend = lines;
            lines = [];
        }
        else {
            linesToSend = lines.slice(0, 10);
            lines = lines.slice(10)
        }

        //TODO: implement the real sender
        console.log("FF: ", linesToSend.map(l => l.toString()).join(","));
        var updatedAwsInfo = awsInfo;
        fulfill(updatedAwsInfo)
    })
}

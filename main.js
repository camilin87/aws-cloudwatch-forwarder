var rfr = require("rfr");
var inputRepository = rfr("lib/inputRepository")();
var promise = require("the-promise-factory");

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
        if (inputRepository.isInputClosed()){
            fulfill();
        }

        sendAvailableLogLines(awsInfo)
            .then((updatedAwsInfo) => {
                sendLogs(updatedAwsInfo).then(fulfill, reject);
            }, reject);
    });
}

function sendAvailableLogLines(awsInfo){
    return promise.create((fulfill, reject) => {
        var lines = inputRepository.getLines();

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
            inputRepository.setLines([]);
        }
        else {
            linesToSend = lines.slice(0, 10);
            inputRepository.setLines(lines.slice(10));
        }

        //TODO: implement the real sender
        console.log("FF: ", linesToSend.map(l => l.message.toString()).join(","));
        var updatedAwsInfo = awsInfo;
        fulfill(updatedAwsInfo)
    })
}

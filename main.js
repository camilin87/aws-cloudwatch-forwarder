var rfr = require("rfr")
var promise = require("the-promise-factory")
var inputRepository = rfr("lib/inputRepository")()
var forwarderServiceFactory = rfr("lib/forwarderServiceFactory")()
var forwarderConfigReader = rfr("lib/forwarderConfigReader")()
var forwarderService = forwarderServiceFactory.create()

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
        var config = forwarderConfigReader.read()
        console.log("FF_CONFIG", config)

        forwarderService
            .init(config)
            .then(() => {
                //TODO simply call fulfill and remove all of this

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
                }, 1000)

            }, reject)
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

        //TODO remove the aws info
        forwarderService
            .send(linesToSend)
            .then(() => {
                var updatedAwsInfo = awsInfo;
                fulfill(updatedAwsInfo)
            }, reject)
    })
}

var rfr = require("rfr")
var promise = require("the-promise-factory")
var inputRepository = rfr("lib/inputRepository")()
var forwarderServiceFactory = rfr("lib/forwarderServiceFactory")()
var forwarderConfigReader = rfr("lib/forwarderConfigReader")()
var forwarderService = forwarderServiceFactory.create()

console.log("FF_AWS_REGION", process.env.AWS_REGION)

var config = forwarderConfigReader.read()
console.log("FF_CONFIG", config)

forwarderService
    .init(config)
    .then(() => {

        sendLogs()
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


function sendLogs(){
    return promise.create((fulfill, reject) => {
        if (inputRepository.isInputClosed()){
            fulfill();
        }

        sendAvailableLogLines()
            .then(() => {
                sendLogs().then(fulfill, reject);
            }, reject);
    });
}

function sendAvailableLogLines(){
    return promise.create((fulfill, reject) => {
        var lines = inputRepository.getLines();

        if (lines.length === 0){

            console.log("X".repeat(30));

            setTimeout(() => {
                fulfill();
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

        forwarderService
            .send(linesToSend)
            .then(fulfill, reject)
    })
}

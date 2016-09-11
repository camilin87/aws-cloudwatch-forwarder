var rfr = require("rfr")
var configReader = rfr("lib/configReader")()
var forwarder = rfr("lib/forwarder")(
    rfr("lib/inputRepository")(),
    rfr("lib/forwarderServiceFactory")(),
    rfr("lib/forwarderConfigReader")()
)

var config = configReader.read()
forwarder
    .run(config)
    .then(() => {
        console.log("FF_COMPLETED");
        process.exit(0);
    }, err => {
        console.log(err, err.stack);
        process.exit(1);
    })
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
        process.exit(0);
    }, err => {
        process.exit(1);
    })
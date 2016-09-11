var rfr = require("rfr")
var forwarder = rfr("lib/forwarder")(
    rfr("lib/inputRepository")(),
    rfr("lib/forwarderServiceFactory")(),
    rfr("lib/forwarderConfigReader")()
)

forwarder
    .run()
    .then(() => {
        console.log("FF_COMPLETED");
        process.exit(0);
    }, err => {
        console.log(err, err.stack);
        process.exit(1);
    })
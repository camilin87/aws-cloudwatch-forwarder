var rfr = require("rfr")
var forwarderService = rfr("lib/forwarderService")
var awsForwarderService = rfr("lib/awsForwarderService")
var stdOutForwarderService = rfr("lib/stdOutForwarderService")
var cloudWatchLogsFactory = rfr("lib/cloudWatchLogsFactory")

module.exports = () => {
    return {
        create: () => {
            var cloudWatchLogs = cloudWatchLogsFactory().create()
            var awsForwarder = awsForwarderService(cloudWatchLogs)

            var stdOutForwarder = stdOutForwarderService()

            var result = forwarderService([
                awsForwarder,
                stdOutForwarder
            ])

            return result
        }
    }
}
var rfr = require("rfr")
var forwarderConfigReader = rfr("lib/forwarderConfigReader")

describe("forwarderConfigReader", () => {
    var reader = null
    var envStub = null

    beforeEach(() => {
        var logStreamNameCalculatorStub = () => "default-log-stream"
        envStub = {}

        reader = forwarderConfigReader(logStreamNameCalculatorStub, envStub)
    })

    it ("provides defaults", () => {
        expect(reader.read()).toEqual({
            aws: {
                logGroupName: "aws-log-forwarder",
                logStreamName: "default-log-stream",
                debug: false,
                enabled: true
            },
            stdout: {
                enabled: true
            }
        })
    })

    it ("reads the std out forwarder config from env settings", () => {
        envStub.FC_STDOUT_ENABLED = false

        expect(reader.read().stdout).toEqual({
            enabled: false
        })
    })

    it ("reads the aws forwarder config from env settings", () => {
        envStub.FC_AWS_LOG_GROUP_NAME = "env-log-group"
        envStub.FC_AWS_LOG_STREAM_NAME = "env-log-stream"
        envStub.FC_AWS_DEBUG = true
        envStub.FC_AWS_ENABLED = false

        expect(reader.read().aws).toEqual({
            logGroupName: "env-log-group",
            logStreamName: "env-log-stream",
            debug: true,
            enabled: false
        })
    })
})
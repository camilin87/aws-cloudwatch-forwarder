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
})
var rfr = require("rfr")
var configReader = rfr("lib/configReader")

describe("configReader", () => {
    var reader = null
    var envStub = null

    beforeEach(() => {
        var logStreamNameCalculatorStub = () => "default-log-stream"
        envStub = {}

        reader = configReader(envStub)
    })

    it ("returns an empty object by default", () => {
        expect(reader.read()).toEqual({})
    })
})
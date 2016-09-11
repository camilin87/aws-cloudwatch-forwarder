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

    it ("reads the input polling interval", () => {
        envStub.FCG_POLLING_INTERVAL = '2000'

        expect(reader.read().readInterval).toBe(2000)
    })

    it ("reads the max messages count per transmission", () => {
        envStub.FCG_MAX_COUNT_PER_TRANSMISSION = '5000'

        expect(reader.read().maxCount).toBe(5000)
    })

    it ("reads the retry count", () => {
        envStub.FCG_RETRY_COUNT = '10'

        expect(reader.read().maxRetries).toBe(10)
    })

    it ("reads the retry delay interval base", () => {
        envStub.FCG_RETRY_DELAY_BASE_INTERVAL = '1000'

        expect(reader.read().retryDelayBase).toBe(1000)
    })
})
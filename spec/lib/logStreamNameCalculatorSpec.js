var rfr = require("rfr")
var calculator = rfr("lib/logStreamNameCalculator")

describe("logStreamNameCalculator", () => {
    it ("is correct", () => {
        var os = {
            hostname: () => "supercomputer"
        }
        var processInfo = {
            platform: "linuxx",
            title: "superprogram",
            pid: 11109
        }

        var logStreamName = calculator(os, processInfo)

        expect(logStreamName).toBe("supercomputer-linuxx-superprogram-11109")
    })
})
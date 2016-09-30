var rfr = require("rfr")
var programInitializer = rfr("lib/programInitializer")

describe("programInitializer", () => {
    var initializer = null

    var processStub = null
    var applicationExecutorStub = null

    beforeEach(() => {
        processStub = {
            argv: []
        }

        applicationExecutorStub = {
            run: () => {}
        }

        initializer = programInitializer(
            processStub,
            null,
            applicationExecutorStub,
            null,
            null
        )
    })

    it ("runs the target application", () => {
        spyOn(applicationExecutorStub, "run")
        processStub.argv = [
            "node", "aws-forwarder",
            "npm", "run", "test", "--format=json"
        ]

        initializer.init()

        expect(applicationExecutorStub.run).toHaveBeenCalledWith("npm run test --format=json")
    })
})
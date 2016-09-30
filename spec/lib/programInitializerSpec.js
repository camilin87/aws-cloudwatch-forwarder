var rfr = require("rfr")
var programInitializer = rfr("lib/programInitializer")

describe("programInitializer", () => {
    var initializer = null

    var processStub = null
    var applicationExecutorStub = null
    var configReaderStub = null

    beforeEach(() => {
        processStub = {
            argv: []
        }

        applicationExecutorStub = {
            run: () => {}
        }

        configReaderStub = {
            read: () => {}
        }

        initializer = programInitializer(
            processStub,
            configReaderStub,
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

    it ("returns the child process of the target application", () => {
        var seededChildProcess = {
            name: "child process",
            getStatus: () => {}
        }
        spyOn(applicationExecutorStub, "run").and.returnValue(seededChildProcess)
        processStub.argv = [
            "node", "aws-forwarder",
            "npm", "start"
        ]

        expect(initializer.init().child).toBe(seededChildProcess)
    })

    it ("returns the configuration", () => {
        var seededConfig = {
            name: "seeded configuration"
        }
        spyOn(configReaderStub, "read").and.returnValue(seededConfig)

        expect(initializer.init().config).toBe(seededConfig)
    })
})
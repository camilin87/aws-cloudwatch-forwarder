var rfr = require("rfr")
var programInitializer = rfr("lib/programInitializer")

describe("programInitializer", () => {
    var initializer = null

    var processStub = null
    var applicationExecutorStub = null
    var configReaderStub = null
    var inputRepositoryFactoryStub = null

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

        inputRepositoryFactoryStub = {
            create: () => {}
        }

        initializer = programInitializer(
            processStub,
            configReaderStub,
            applicationExecutorStub,
            inputRepositoryFactoryStub,
            null
        )
    })

    function setupApplicationExecutorResult(seededChildProcess) {
        if (!seededChildProcess){
            seededChildProcess = {
                getStatus: () => null
            }
        }

        spyOn(applicationExecutorStub, "run").and.returnValue(seededChildProcess)
    }

    it ("runs the target application", () => {
        setupApplicationExecutorResult()
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
        setupApplicationExecutorResult(seededChildProcess)
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
        setupApplicationExecutorResult()

        expect(initializer.init().config).toBe(seededConfig)
    })

    it ("creates an inputRepository", () => {
        setupApplicationExecutorResult({
            getStatus: () => "child status"
        })
        spyOn(inputRepositoryFactoryStub, "create")

        initializer.init()

        expect(inputRepositoryFactoryStub.create).toHaveBeenCalledWith("child status")
    })
})
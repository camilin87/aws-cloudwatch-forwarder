var rfr = require("rfr")
var applicationExecutor = rfr("lib/applicationExecutor")

describe("applicationExecutor", ()  =>{
    var executor = null
    var childProcessStub = null
    var childProcess = null

    beforeEach(() => {
        childProcess = {
            stdout: "the stdout of a child",
            stderr: "the stderr of a child",
            on: () => {}
        }

        childProcessStub = {
            spawn: () => {}
        }
        spyOn(childProcessStub, "spawn").and.returnValue(childProcess)

        executor = applicationExecutor(childProcessStub)
    })

    it ("spaws a process", () => {
        executor.run("npm run test --format=json")

        expect(childProcessStub.spawn).toHaveBeenCalledWith("npm", ["run test --format=json"], {stdio: "pipe"})
    })

    it ("returns the correct status", () => {
        expect(executor.run("npm run test --format=json").getStatus())
            .toEqual({
                closed: false,
                stdout: "the stdout of a child",
                stderr: "the stderr of a child"
            })
    })

    it ("bubbles up the child process exit code", done => {
        var awaitedEvent = null
        childProcess.on = (eventName, callback) => {
            awaitedEvent = eventName
            callback(25, null)
        }

        var child = executor.run("npm run test --format=json")

        child.wait().then(code => {
            expect(code).toBe(25)
            expect(awaitedEvent).toBe("exit")
            done()
        })
    })

    it ("assumes failure exit code when none is provided", done => {
        childProcess.on = (eventName, callback) => {
            callback(null, null)
        }

        var child = executor.run("npm run test --format=json")

        child.wait().then(code => {
            expect(code).toBe(1)
            done()
        })
    })

    it ("signals when the childprocess is closed", done => {
        childProcess.on = (eventName, callback) => {
            callback(0, null)
        }

        var child = executor.run("npm run test --format=json")

        child.wait().then(code => {
            expect(child.getStatus().closed).toBe(true)
            done()
        })
    })
})
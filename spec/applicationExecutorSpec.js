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
})
var rfr = require("rfr")
var applicationExecutor = rfr("lib/applicationExecutor")

describe("applicationExecutor", ()  =>{
    var executor = null
    var childProcessStub = null

    beforeEach(() => {
        childProcessStub = {
            spawn: () => {}
        }

        executor = applicationExecutor(childProcessStub)
    })

    it ("spaws a process", () => {
        spyOn(childProcessStub, "spawn").and.returnValue({
            on: () => {}
        })

        executor.run("npm run test --format=json")

        expect(childProcessStub.spawn).toHaveBeenCalled()
    })
})
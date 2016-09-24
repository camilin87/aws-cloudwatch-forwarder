var rfr = require("rfr")
var inputRepository = rfr("lib/inputRepository")

describe("inputRepository", () => {
    var processMock = {
        stdin: "the std in",
        stdout: "the std out"
    }

    var readlineMock = null
    var createdInterface = null
    var rlStub = null
    var rlCallbacks = null

    var repository = null

    beforeEach(() => {
        rlCallbacks = {}
        rlStub = {
            on: (streamName, callback) => {
                rlCallbacks[streamName] = callback
            }
        }

        createdInterface = null
        readlineMock = {
            createInterface: (info) => {
                createdInterface = info
                return rlStub
            }
        }

        var invocationCount = 0
        var currentTime = () => {
            invocationCount += 1
            return invocationCount
        }

        repository = inputRepository(null, readlineMock, processMock, currentTime)
    })

    function sendLine(line) {
        rlCallbacks["line"](line)
    }

    function closeInputStream() {
        rlCallbacks["close"]()
    }

    it ("initializes the readline module with the correct parameters", () => {
        expect(createdInterface).toEqual({
            input: "the std in",
            output: "the std out",
            terminal: false
        })
    })

    it ("isInputClosed is false by default", () => {
        expect(repository.isInputClosed()).toBe(false)
    })

    it ("isInputClosed is true when there are no lines and the stream was closed", () => {
        closeInputStream()

        expect(repository.isInputClosed()).toBe(true)
    })

    it ("there are no lines by default", () => {
        expect(repository.getLines()).toEqual([])
    })

    it ("reads the lines", () => {
        sendLine("line 1")
        sendLine("line 2")
        sendLine("line 3")

        expect(repository.getLines()).toEqual([
            {timestamp: 1, message: "line 1"},
            {timestamp: 2, message: "line 2"},
            {timestamp: 3, message: "line 3"}
        ])
    })

    it ("sets the lines", () => {
        repository.setLines([
            {timestamp: 10, message: "line 1"},
            {timestamp: 20, message: "line 2"},
            {timestamp: 30, message: "line 3"}
        ])

        expect(repository.getLines()).toEqual([
            {timestamp: 10, message: "line 1"},
            {timestamp: 20, message: "line 2"},
            {timestamp: 30, message: "line 3"}
        ])
    })

    it ("the lines cannot be set to null", () => {
        repository.setLines(null)

        expect(repository.getLines()).toEqual([])
    })

    it ("isInputClosed is false when the stream is closed but there are lines", () => {
        repository.setLines([
            "line 1",
            "line 2",
            "line 3",
        ])
        closeInputStream()

        expect(repository.isInputClosed()).toBe(false)
    })
})
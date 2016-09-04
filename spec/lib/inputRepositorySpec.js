var rfr = require("rfr");
var inputRepository = rfr("lib/inputRepository");

describe("inputRepository", () => {
    var processMock = {
        stdin: "the std in",
        stdout: "the std out"
    }

    var readlineMock = null;
    var createdInterface = null;
    var rlStub = null;
    var rlCallbacks = null;

    beforeEach(() => {
        rlCallbacks = {};
        rlStub = {
            on: (streamName, callback) => {
                rlCallbacks[streamName] = callback;
            }
        };

        createdInterface = null;
        readlineMock = {
            createInterface: (info) => {
                createdInterface = info;
                return rlStub;
            }
        };
    })

    function sendLine(line) {
        rlCallbacks["line"](line);
    }

    function closeInputStream() {
        rlCallbacks["close"]();
    }

    it ("initializes the readline module with the correct parameters", () => {
        inputRepository(readlineMock, processMock);

        expect(createdInterface).toEqual({
            input: "the std in",
            output: "the std out",
            terminal: false
        });
    })

    it ("isInputClosed is false by default", () => {
        var repository = inputRepository(readlineMock, processMock);

        expect(repository.isInputClosed()).toBe(false);
    })

    it ("isInputClosed is true when there are no lines and the stream was closed", () => {
        var repository = inputRepository(readlineMock, processMock);

        closeInputStream();

        expect(repository.isInputClosed()).toBe(true);
    })

    it ("there are no lines by default", () => {
        var repository = inputRepository(readlineMock, processMock);

        expect(repository.getLines()).toEqual([]);
    })

    it ("sets the lines", () => {
        var repository = inputRepository(readlineMock, processMock);

        repository.setLines([
            "line 1",
            "line 2",
            "line 3",
        ]);

        expect(repository.getLines()).toEqual([
            "line 1",
            "line 2",
            "line 3",
        ]);
    })

    it ("the lines cannot be set to null", () => {
        var repository = inputRepository(readlineMock, processMock);

        repository.setLines(null);

        expect(repository.getLines()).toEqual([]);
    })

    it ("isInputClosed is false when the stream is closed but there are lines", () => {
        var repository = inputRepository(readlineMock, processMock);

        repository.setLines([
            "line 1",
            "line 2",
            "line 3",
        ]);
        closeInputStream();

        expect(repository.isInputClosed()).toBe(false);
    })
})
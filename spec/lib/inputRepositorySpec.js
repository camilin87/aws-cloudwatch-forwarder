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

    beforeEach(() => {
        createdInterface = null;
        readlineMock = {
            createInterface: (info) => {
                createdInterface = info;
                return rlStub;
            }
        }
    })

    it ("initializes the readline module with the correct parameters", () => {
        inputRepository(readlineMock, processMock);

        expect(createdInterface).toEqual({
            input: "the std in",
            output: "the std out",
            terminal: false
        });
    })
})
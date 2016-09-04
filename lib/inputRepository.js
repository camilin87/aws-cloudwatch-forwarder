module.exports = function (readlineModule, currentProcess) {
    if (!readlineModule){
        readlineModule = require("readline");
    }

    if (!currentProcess){
        currentProcess = process;
    }

    var isListening = true;

    var rl = readlineModule.createInterface({
        input: currentProcess.stdin,
        output: currentProcess.stdout,
        terminal: false
    });

    rl.on("close", () => isListening = false);

    return {
        isInputClosed: () => {
            return !isListening
        },
        getLines: () => {},
        setLines: lines => {}
    }
}
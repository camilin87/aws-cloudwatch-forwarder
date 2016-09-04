module.exports = function (readlineModule, currentProcess) {
    if (!readlineModule){
        readlineModule = require("readline");
    }

    if (!currentProcess){
        currentProcess = process;
    }

    var isListening = true;
    var lines = [];

    var rl = readlineModule.createInterface({
        input: currentProcess.stdin,
        output: currentProcess.stdout,
        terminal: false
    });

    rl.on("close", () => isListening = false);
    rl.on("line", (l) => lines.push(l));

    return {
        isInputClosed: () => !isListening && lines.length === 0,
        getLines: () => lines,
        setLines: updatedLines => lines = (updatedLines || [])
    }
}
module.exports = function (readlineModule, currentProcess, currentTime) {
    if (!readlineModule){
        readlineModule = require("readline");
    }

    if (!currentProcess){
        currentProcess = process;
    }

    if (!currentTime){
        currentTime = () => new Date().getTime()
    }

    var isListening = true;
    var lines = [];

    var rl = readlineModule.createInterface({
        input: currentProcess.stdin,
        output: currentProcess.stdout,
        terminal: false
    });

    rl.on("close", () => isListening = false);
    rl.on("line", (l) => lines.push({timestamp: currentTime(), message: l}));

    return {
        isInputClosed: () => isListening === false && lines.length === 0,
        getLines: () => lines,
        setLines: updatedLines => lines = (updatedLines || [])
    }
}
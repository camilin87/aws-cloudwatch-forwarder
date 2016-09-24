module.exports = function (childProcessStatus, readlineModule, currentProcess, currentTime) {
    if (!readlineModule){
        readlineModule = require("readline");
    }

    if (!currentProcess){
        currentProcess = process
    }

    if (!currentTime){
        currentTime = () => new Date().getTime()
    }

    var isListening = true;
    var lines = [];

    var rl = readlineModule.createInterface({
        input: currentProcess.stdout,
        terminal: false
    });

    rl.on("close", () => isListening = false);
    rl.on("line", (l) => lines.push({timestamp: currentTime(), message: l}));

    return {
        isInputClosed: () => {
            if (lines.length === 0){
                var childProcessIsClosed = (childProcessStatus || {}).closed
                return (isListening === false || childProcessIsClosed === true)
            }

            return false
        },
        getLines: () => lines,
        setLines: updatedLines => lines = (updatedLines || [])
    }
}
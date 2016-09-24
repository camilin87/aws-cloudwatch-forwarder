var split = require("split")

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

    childProcessStatus.stdout
        .pipe(split())
        .on('data', l => lines.push({timestamp: currentTime(), message: l}))

    childProcessStatus.stderr
        .pipe(split())
        .on('data', l => lines.push({timestamp: currentTime(), message: l}))

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
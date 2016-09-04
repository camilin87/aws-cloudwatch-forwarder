module.exports = function (readlineModule, currentProcess) {
    if (!readlineModule){
        readlineModule = require("readline");
    }

    if (!currentProcess){
        currentProcess = process;
    }


    var rl = readlineModule.createInterface({
        input: currentProcess.stdin,
        output: currentProcess.stdout,
        terminal: false
    });

    return {
        isInputClosed: () => {
            return false
        },
        getLines: () => {},
        setLines: lines => {}
    }
}
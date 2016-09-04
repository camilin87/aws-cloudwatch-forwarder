module.exports = function (readline, process) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    return {
        isInputClosed: function () {},
        getLines: function () {},
        setLines: function (lines) {}
    }
}
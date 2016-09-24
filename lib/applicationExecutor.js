var promise = require("the-promise-factory")

module.exports = (childProcess) => {
    return {
        run: (targetApplication) => {
            var appPieces = targetApplication.split(" ")
            var appName = appPieces[0]
            var appArgs = appPieces.slice(1).join(" ")

            var child = childProcess.spawn(appName, [appArgs], {stdio: "pipe"})
            // var child = childProcess.exec(targetApplication)
            var outputStream = child.stdout

            return {
                getOutputStream: () => outputStream,
                wait: () => {
                    return promise.create((fulfill, reject) => {
                        child.on('exit', function(code, signal) {
                            if (code === null){
                                code = 1
                            }

                            fulfill(code)
                        })
                    })
                }
            }
        }
    }
}
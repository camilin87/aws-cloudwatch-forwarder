var promise = require("the-promise-factory")

module.exports = (childProcess) => {
    return {
        run: (targetApplication) => {
            var appPieces = targetApplication.split(" ")
            var appName = appPieces[0]
            var appArgs = appPieces.slice(1).join(" ")

            var child = childProcess.spawn(appName, [appArgs], {stdio: "inherit"})
            var outputStream = child.stdout

            var childProcessStatus = {
                closed: false
            }

            return {
                getOutputStream: () => outputStream,
                getStatus: () => childProcessStatus,
                wait: () => {
                    return promise.create((fulfill, reject) => {
                        child.on('exit', function(code, signal) {
                            childProcessStatus.closed = true

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
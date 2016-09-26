var promise = require("the-promise-factory")

module.exports = (childProcess) => {
    return {
        run: (targetApplication) => {
            var appPieces = targetApplication.split(" ")
            var appName = appPieces[0]
            var appArgs = appPieces.slice(1).join(" ")

            var child = childProcess.spawn(appName, [appArgs], {stdio: "pipe"})

            var childProcessStatus = {
                closed: false,
                stdout: child.stdout,
                stderr: child.stderr
            }

            return {
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
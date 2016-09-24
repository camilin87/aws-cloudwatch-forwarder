var promise = require("the-promise-factory")

module.exports = (childProcess) => {
    return {
        config: (targetApplication) => {
            var appPieces = targetApplication.split(" ")
            var appName = appPieces[0]
            var appArgs = appPieces.slice(1).join(" ")

            var childProcessStatus = {
                closed: false
            }

            return {
                getStatus: () => childProcessStatus,
                run: () => {
                    return promise.create((fulfill, reject) => {
                        var child = childProcess.spawn(appName, [appArgs], {stdio: "inherit"})

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
var promise = require("the-promise-factory")

module.exports = (childProcess) => {
    return {
        run: (targetApplication) => {
            var child = childProcess.exec(targetApplication)
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
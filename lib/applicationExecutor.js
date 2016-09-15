var promise = require("the-promise-factory")

module.exports = (childProcess) => {
    return {
        run: (targetApplication) => {
            return promise.create((fulfill, reject) => {
                var child = childProcess.exec(targetApplication)
                child.stdout.pipe(process.stdin)
                child.stderr.pipe(process.stdin)
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
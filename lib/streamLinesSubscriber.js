var split = require("split")

module.exports = () => {
    return {
        subscribe: (stream, callback) => {
            stream
                .pipe(split())
                .on('data', callback)
        }
    }
}
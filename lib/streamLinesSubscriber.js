var split = require("split")

module.exports = () => {
    return {
        subscribe: (stream, callback) => {
            stream
                .pipe(split(/\r?\n(?!\s)/gms))
                .on('data', callback)
        }
    }
}

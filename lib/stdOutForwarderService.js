module.exports = () => {
    return {
        init: () => {},
        send: loglines => {
            loglines
                .map(l => l.message)
                .forEach(l => console.log(l))
        }
    }
}
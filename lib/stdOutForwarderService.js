module.exports = () => {
    var initConfig = {
        disabled: false
    }

    return {
        init: (config) => {
            config = config || {}
            config.stdOut = config.stdOut || {}
            if (config.stdOut.disabled === true){
                initConfig.disabled = true
            }
        },
        send: loglines => {
            if (initConfig.disabled){
                return
            }

            loglines
                .map(l => l.message)
                .forEach(l => console.log(l))
        }
    }
}
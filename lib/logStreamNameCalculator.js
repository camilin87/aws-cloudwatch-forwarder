var osModule = require("os")

module.exports = (os, processInfo) => {
    if (!os){
        os = osModule
    }

    if (!processInfo){
        processInfo = process
    }

    return `${os.hostname()}-${processInfo.platform}-${processInfo.title}-${processInfo.pid}`
}
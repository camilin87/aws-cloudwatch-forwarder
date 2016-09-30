var rfr = require("rfr")
var inputRepositoryModule = rfr("lib/inputRepository")

module.exports = (inputRepositoryFn) => {
    if (!inputRepositoryFn){
        inputRepositoryFn = inputRepositoryModule
    }

    return {
        create: childProcessStatus => {
            return inputRepositoryFn(childProcessStatus)
        }
    }
}
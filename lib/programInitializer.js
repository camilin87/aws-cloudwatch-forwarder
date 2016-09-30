module.exports = (
        processModule,
        configReader, applicationExecutor,
        inputRepositoryFactory, forwarderFactory
    ) => {
    return {
        init: () => {
            var targetApplication = processModule.argv.slice(2).join(" ")
            var childProcess = applicationExecutor.run(targetApplication)

            return {
                child: childProcess
            }
        }
    }
}
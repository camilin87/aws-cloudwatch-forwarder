module.exports = (
        processModule,
        configReader, applicationExecutor,
        inputRepositoryFactory, forwarderFactory
    ) => {
    return {
        init: () => {
            var targetApplication = processModule.argv.slice(2).join(" ")
            var childProcess = applicationExecutor.run(targetApplication)

            var inputRepository = inputRepositoryFactory.create(childProcess.getStatus())
            var forwarder = forwarderFactory.create(inputRepository)

            return {
                child: childProcess,
                config: configReader.read()
            }
        }
    }
}
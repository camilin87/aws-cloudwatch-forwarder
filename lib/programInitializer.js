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

            return {
                child: childProcess,
                config: configReader.read(),
                forwarder: forwarderFactory.create(inputRepository)
            }
        }
    }
}
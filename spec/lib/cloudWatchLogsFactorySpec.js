var rfr = require("rfr")
var cloudWatchLogsFactory = rfr("lib/cloudWatchLogsFactory")

describe("cloudWatchLogsFactory", () => {
    var factory = null
    var envStub = null
    var awsStub = null

    beforeEach(() => {
        envStub = {}
        awsStub = {
            config: {
                update: () => {}
            },
            CloudWatchLogs: function () {}
        }

        factory = cloudWatchLogsFactory(awsStub, envStub)
    })

    it ("updates the aws config reading the variables from the environment", () => {
        envStub.AWS_REGION = "region1"
        envStub.AWS_ACCESS_KEY_ID = "accesskey"
        envStub.AWS_SECRET_ACCESS_KEY = "secretkey"
        spyOn(awsStub.config, "update")

        factory.create()

        expect(awsStub.config.update).toHaveBeenCalledWith({
            region: "region1",
            accessKeyId: "accesskey",
            secretAccessKey: "secretkey"
        })
    })

    it ("creates the CloudWatchLogs service", () => {
        awsStub.CloudWatchLogs = function (){
            return {name: "service1"}
        }

        expect(factory.create()).toEqual({name: "service1"})
    })
})

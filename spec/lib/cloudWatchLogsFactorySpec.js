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
        spyOn(awsStub.config, "update")

        factory = cloudWatchLogsFactory(awsStub, envStub)
    })

    it ("updates the aws config reading the variables from the environment", () => {
        envStub.AWS_REGION = "region1"
        envStub.AWS_ACCESS_KEY_ID = "accesskey"
        envStub.AWS_SECRET_ACCESS_KEY = "secretkey"

        factory.create()

        expect(awsStub.config.update).toHaveBeenCalledWith({
            region: "region1",
            accessKeyId: "accesskey",
            secretAccessKey: "secretkey"
        })
    })

    it ("creates the CloudWatchLogs service", () => {
        envStub.AWS_REGION = "region1"
        envStub.AWS_ACCESS_KEY_ID = "accesskey"
        envStub.AWS_SECRET_ACCESS_KEY = "secretkey"

        awsStub.CloudWatchLogs = function (){
            return {name: "service1"}
        }

        expect(factory.create()).toEqual({name: "service1"})
    })

    it ("blows up when no region is specified", () => {
        envStub.AWS_ACCESS_KEY_ID = "accesskey"
        envStub.AWS_SECRET_ACCESS_KEY = "secretkey"

        expect(() => factory.create()).toThrow(new Error("AWS_REGION missing"))
    })

    it ("blows up when no access key is specified", () => {
        envStub.AWS_REGION = "region1"
        envStub.AWS_SECRET_ACCESS_KEY = "secretkey"

        expect(() => factory.create()).toThrow(new Error("AWS_ACCESS_KEY_ID missing"))
    })

    it ("blows up when no secret access key is specified", () => {
        envStub.AWS_REGION = "region1"
        envStub.AWS_ACCESS_KEY_ID = "accesskey"

        expect(() => factory.create()).toThrow(new Error("AWS_SECRET_ACCESS_KEY missing"))
    })
})

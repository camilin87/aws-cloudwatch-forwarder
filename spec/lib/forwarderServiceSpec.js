var rfr = require("rfr");
var forwarderService = rfr("lib/forwarderService");

describe("forwarderService", function() {
    var service = null;
    var cloudwatchLogsStub = null;

    beforeEach(() => {
        cloudwatchLogsStub = {
            describeLogGroups: () => {},
            createLogGroup: () => {},
            describeLogStreams: () => {}
        }

        service = forwarderService(cloudwatchLogsStub);
    })

    function describeLogGroupsWillReturn(data) {
        spyOn(cloudwatchLogsStub, "describeLogGroups").and.callFake((info, callback) => {
            callback(null, data);
        });
    }

    function createLogGroupsWillSucceed(){
        spyOn(cloudwatchLogsStub, "createLogGroup").and.callFake((info, callback) => {
            callback(null);
        });
    }

    function describeLogStreamsWillReturn(data) {
        spyOn(cloudwatchLogsStub, "describeLogStreams").and.callFake((info, callback) => {
            callback(null, data);
        });
    }

    describe("init", () => {
        var initConfig = {
            aws: {
                logGroupName: "the-log-groupname",
                logStreamName: "the-log-stream"
            }
        };

        it ("determines if the log group exists", done => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({})

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.describeLogGroups).toHaveBeenCalledWith({
                    logGroupNamePrefix: "the-log-groupname"
                }, jasmine.any(Function))
                done()
            })
        })

        it ("fails when log group could not be described", done => {
            spyOn(cloudwatchLogsStub, "describeLogGroups").and.callFake((info, callback) => {
                callback("something went wrong")
            });

            service.init(initConfig).then(null, (err) => {
                expect(err).toBe("something went wrong")
                done()
            })
        })

        it ("creates a log group if it doesn't already exists", done => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({})

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.createLogGroup).toHaveBeenCalledWith({
                    logGroupName: "the-log-groupname"
                }, jasmine.any(Function))
                done()
            })
        })

        it ("fails when the log group creation fails", done => {
            describeLogGroupsWillReturn({});
            spyOn(cloudwatchLogsStub, "createLogGroup").and.callFake((info, callback) => {
                callback("something went wrong")
            });

            service.init(initConfig).then(null, (err) => {
                expect(err).toBe("something went wrong");
                done();
            })
        })

        it ("does not create the log group if it already exists", done => {
            describeLogGroupsWillReturn({
                logGroups: [
                    {logGroupName: "aaaa"},
                    {logGroupName: "the-log-groupname"}
                ]
            });
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({})

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.createLogGroup).not.toHaveBeenCalled()
                done()
            })
        })

        it ("reads what log streams exist", done => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({})

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.describeLogStreams).toHaveBeenCalledWith({
                    logGroupName: "the-log-groupname",
                    logStreamNamePrefix: "the-log-stream"
                }, jasmine.any(Function))
                done()
            })
        })

        it ("fails when the log streams could not be read", (done) => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            spyOn(cloudwatchLogsStub, "describeLogStreams").and.callFake((info, callback) => {
                callback("something went wrong")
            })

            service.init(initConfig).then(null, (err) => {
                expect(err).toBe("something went wrong");
                done();
            })
        })
    })
})

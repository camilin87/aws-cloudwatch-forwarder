var rfr = require("rfr");
var forwarderService = rfr("lib/forwarderService");

describe("forwarderService", function() {
    var service = null;
    var cloudwatchLogsStub = null;

    beforeEach(() => {
        cloudwatchLogsStub = {
            describeLogGroups: () => {},
            createLogGroup: () => {}
        }

        service = forwarderService(cloudwatchLogsStub);
    })

    function describeLogGroupsWillReturn(data) {
        spyOn(cloudwatchLogsStub, "describeLogGroups").and.callFake((info, callback) => {
            callback(null, data);
        });
    }

    describe("init", () => {
        var initConfig = {
            aws: {
                logGroupName: "the-log-groupname"
            }
        };

        it ("determines if the log group exists", (done) => {
            describeLogGroupsWillReturn({});

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.describeLogGroups).toHaveBeenCalledWith({
                    logGroupNamePrefix: "the-log-groupname"
                }, jasmine.any(Function));
                done();
            })
        })

        it ("fails when log group could not be described", (done) => {
            spyOn(cloudwatchLogsStub, "describeLogGroups").and.callFake((info, callback) => {
                callback("something went wrong");
            });

            service.init(initConfig).then(null, (err) => {
                expect(err).toBe("something went wrong");
                done();
            })
        })

        it ("creates a log group if it doesn't already exists", (done) => {
            describeLogGroupsWillReturn({});
            spyOn(cloudwatchLogsStub, "createLogGroup");

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.createLogGroup).toHaveBeenCalledWith({
                    logGroupName: "the-log-groupname"
                }, jasmine.any(Function));
                done();
            })
        })
    })
})

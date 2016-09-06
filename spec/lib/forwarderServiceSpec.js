var rfr = require("rfr");
var forwarderService = rfr("lib/forwarderService");

describe("forwarderService", function() {
    var service = null;
    var cloudwatchLogsStub = null;

    beforeEach(() => {
        cloudwatchLogsStub = {
            describeLogGroups: () => {}
        }

        service = forwarderService(cloudwatchLogsStub);
    })

    describe("init", () => {
        it ("determines if the log group exists", (done) => {
            spyOn(cloudwatchLogsStub, "describeLogGroups").and.callFake((info, callback) => {
                callback(null, {});
            });

            service.init({
                aws: {
                    logGroupName: "the-log-groupname"
                }
            }).then(() => {
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

            service.init({
                aws: {
                    logGroupName: "the-log-groupname"
                }
            }).then(null, (err) => {
                expect(err).toBe("something went wrong");
                done();
            })
        })
    })
})

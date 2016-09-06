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
            spyOn(cloudwatchLogsStub, "describeLogGroups");

            service.init({
                aws: {
                    logGroupName: "the-log-groupname"
                }
            }).then(() => {
                expect(cloudwatchLogsStub.describeLogGroups).toHaveBeenCalledWith({
                    logGroupNamePrefix: "the-log-groupname"
                });
                done();
            })
        })
    })
})

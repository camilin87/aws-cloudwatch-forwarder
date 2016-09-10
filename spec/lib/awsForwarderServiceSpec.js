var rfr = require("rfr");
var async = require("async")
var awsForwarderService = rfr("lib/awsForwarderService")

describe("awsForwarderService", function() {
    var initConfig = {
        aws: {
            logGroupName: "the-log-groupname",
            logStreamName: "the-log-stream"
        }
    };

    var service = null;
    var cloudwatchLogsStub = null;

    beforeEach(() => {
        cloudwatchLogsStub = {
            describeLogGroups: () => {},
            createLogGroup: () => {},
            describeLogStreams: () => {},
            createLogStream: () => {},
            putLogEvents: () => {}
        }

        service = awsForwarderService(cloudwatchLogsStub);
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

    function createLogStreamWillSucceed(){
        spyOn(cloudwatchLogsStub, "createLogStream").and.callFake((info, callback) => {
            callback(null);
        });
    }

    function putLogEventsWillSucceed(sequenceTokenGenerator){
        if (!sequenceTokenGenerator){
            sequenceTokenGenerator = () => null
        }

        spyOn(cloudwatchLogsStub, "putLogEvents").and.callFake((info, callback) => {
            var data = {
                nextSequenceToken: sequenceTokenGenerator()
            }
            callback(null, data)
        });
    }

    describe("init", () => {
        it ("requires a log group name", () => {
            expect(() => service.init()).toThrow(new Error("a logGroupName is required"))
        })

        it ("requires a log stream name", () => {
            var config = {
                aws: {
                    logGroupName: "aaa"
                }
            }

            expect(() => service.init(config)).toThrow(new Error("a logStreamName is required"))
        })

        it ("determines if the log group exists", done => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({})
            createLogStreamWillSucceed()

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
            createLogStreamWillSucceed()

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
            createLogStreamWillSucceed()

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.createLogGroup).not.toHaveBeenCalled()
                done()
            })
        })

        it ("reads what log streams exist", done => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({})
            createLogStreamWillSucceed()

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.describeLogStreams).toHaveBeenCalledWith({
                    logGroupName: "the-log-groupname",
                    logStreamNamePrefix: "the-log-stream"
                }, jasmine.any(Function))
                done()
            })
        })

        it ("fails when the log streams could not be read", done => {
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

        it ("creates the log stream if it doesn't exist", done => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({})
            createLogStreamWillSucceed()

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.createLogStream).toHaveBeenCalledWith({
                    logGroupName: "the-log-groupname",
                    logStreamName: "the-log-stream"
                }, jasmine.any(Function))
                done()
            })
        })

        it ("fails when the log stream could not be created", done => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({})
            spyOn(cloudwatchLogsStub, "createLogStream").and.callFake((info, callback) => {
                callback("something went wrong")
            })

            service.init(initConfig).then(null, (err) => {
                expect(err).toBe("something went wrong");
                done();
            })
        })

        it ("does not create the log stream if it already exist", done => {
            describeLogGroupsWillReturn({})
            createLogGroupsWillSucceed()
            describeLogStreamsWillReturn({
                logStreams: [
                    {logStreamName: "pepitin"},
                    {logStreamName: "the-log-stream"}
                ]
            })
            createLogStreamWillSucceed()

            service.init(initConfig).then(() => {
                expect(cloudwatchLogsStub.createLogStream).not.toHaveBeenCalled()
                done()
            })
        })
    })

    describe("send", () => {

        function generateMessages(count){
            var result = []
            for (var i = 0; i < count; i++){
                result.push({
                    timestamp: i,
                    message: `line ${i + 1}`
                })
            }
            return result
        }

        describe("on new streams", () => {
            beforeEach(() => {
                describeLogGroupsWillReturn({})
                createLogGroupsWillSucceed()
                describeLogStreamsWillReturn({})
                createLogStreamWillSucceed()

                service.init(initConfig)
            })

            it ("does not transmit anything when there are no messages", done => {
                putLogEventsWillSucceed()

                service
                    .send(generateMessages(0))
                    .then(() => {
                        expect(cloudwatchLogsStub.putLogEvents).not.toHaveBeenCalled()
                        done()
                    })
            })

            it ("does not transmit empty messages", done => {
                putLogEventsWillSucceed()

                var allMessages = generateMessages(10)
                allMessages[0].message = null
                allMessages[3].message = ""
                allMessages[6].message = undefined

                service
                    .send(allMessages)
                    .then(() => {
                        expect(cloudwatchLogsStub.putLogEvents).toHaveBeenCalledWith({
                            logEvents: [
                                {timestamp: 1, message: "line 2"},
                                {timestamp: 2, message: "line 3"},
                                {timestamp: 4, message: "line 5"},
                                {timestamp: 5, message: "line 6"},
                                {timestamp: 7, message: "line 8"},
                                {timestamp: 8, message: "line 9"},
                                {timestamp: 9, message: "line 10"}
                            ],
                            logGroupName: "the-log-groupname",
                            logStreamName: "the-log-stream"
                        }, jasmine.any(Function))
                        done()
                    })
            })

            it ("sends the correct information", done => {
                putLogEventsWillSucceed()

                service
                    .send(generateMessages(2))
                    .then(() => {
                        expect(cloudwatchLogsStub.putLogEvents).toHaveBeenCalledWith({
                            logEvents: [
                                {timestamp: 0, message: "line 1"},
                                {timestamp: 1, message: "line 2"}
                            ],
                            logGroupName: "the-log-groupname",
                            logStreamName: "the-log-stream"
                        }, jasmine.any(Function))
                        done()
                    })
            })

            it ("fails when log transmission failed", done => {
                spyOn(cloudwatchLogsStub, "putLogEvents").and.callFake((info, callback) => {
                    callback("something went wrong");
                });

                service
                    .send(generateMessages(2))
                    .then(null, (err) => {
                        expect(err).toBe("something went wrong")
                        done()
                    })
            })

            it ("sends the correct sequence token in subsequent responses", done => {
                var nextSequenceToken = 1000
                putLogEventsWillSucceed(() => {
                    nextSequenceToken += 1
                    return nextSequenceToken
                })
                function sendOneMessage(callback){
                    service.send(generateMessages(1))
                        .then(() => callback(null), callback)
                }

                async.series([
                    sendOneMessage,
                    sendOneMessage,
                    sendOneMessage
                ], err => {
                    if (err){
                        jasmine.getEnv().fail("sending messages failed")
                        done()
                        return
                    }

                    expect(cloudwatchLogsStub.putLogEvents).toHaveBeenCalledWith({
                        logEvents: [
                            {timestamp: 0, message: "line 1"}
                        ],
                        logGroupName: "the-log-groupname",
                        logStreamName: "the-log-stream"
                    }, jasmine.any(Function))

                    expect(cloudwatchLogsStub.putLogEvents).toHaveBeenCalledWith({
                        logEvents: [
                            {timestamp: 0, message: "line 1"}
                        ],
                        logGroupName: "the-log-groupname",
                        logStreamName: "the-log-stream",
                        sequenceToken: 1001
                    }, jasmine.any(Function))

                    expect(cloudwatchLogsStub.putLogEvents).toHaveBeenCalledWith({
                        logEvents: [
                            {timestamp: 0, message: "line 1"}
                        ],
                        logGroupName: "the-log-groupname",
                        logStreamName: "the-log-stream",
                        sequenceToken: 1002
                    }, jasmine.any(Function))

                    done()
                })
            })
        })

        describe("on existing streams", () => {
            beforeEach(() => {
                describeLogGroupsWillReturn({})
                createLogGroupsWillSucceed()
                describeLogStreamsWillReturn({
                    logStreams: [
                        {logStreamName: "pepitin"},
                        {logStreamName: "the-log-stream", uploadSequenceToken: 2000}
                    ]
                })

                service.init(initConfig)
            })

            it ("sends the correct information", done => {
                putLogEventsWillSucceed()

                service
                    .send(generateMessages(2))
                    .then(() => {
                        expect(cloudwatchLogsStub.putLogEvents).toHaveBeenCalledWith({
                            logEvents: [
                                {timestamp: 0, message: "line 1"},
                                {timestamp: 1, message: "line 2"}
                            ],
                            logGroupName: "the-log-groupname",
                            logStreamName: "the-log-stream",
                            sequenceToken: 2000
                        }, jasmine.any(Function))
                        done()
                    })
            })
        })
    })
})

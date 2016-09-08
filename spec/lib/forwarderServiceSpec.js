var rfr = require("rfr")
var promise = require("the-promise-factory")
var forwarderService = rfr("lib/forwarderService")

describe("forwarderService", () => {
    var seededConfig = { name: "myconfig" }

    var service = null
    var forwarder1 = null
    var forwarder2 = null

    function createForwarder(){
        return {
            init: () => {},
            send: () => {}
        }
    }

    function initWillSucceed(forwarder){
        spyOn(forwarder, "init")
            .and
            .callFake(config => promise.create((fulfill, reject) => fulfill()))
    }

    function initWillFail(forwarder, err){
        spyOn(forwarder, "init")
            .and
            .callFake(config => promise.create((fulfill, reject) => reject(err)))
    }

    function sendWillSucceed(forwarder){
        spyOn(forwarder, "send")
            .and
            .callFake(config => promise.create((fulfill, reject) => fulfill()))
    }

    function sendWillFail(forwarder, err){
        spyOn(forwarder, "send")
            .and
            .callFake(config => promise.create((fulfill, reject) => reject(err)))
    }

    beforeEach(() => {
        forwarder1 = createForwarder()
        forwarder2 = createForwarder()

        service = forwarderService([
            forwarder1,
            forwarder2
        ])
    })

    describe("init", () => {
        it ("calls init on every forwarder", done => {
            initWillSucceed(forwarder1)
            initWillSucceed(forwarder2)

            service.init(seededConfig).then(() => {
                expect(forwarder1.init).toHaveBeenCalledWith(seededConfig)
                expect(forwarder2.init).toHaveBeenCalledWith(seededConfig)
                done()
            })
        })

        it ("fails when at least one forwarder fails", done => {
            initWillSucceed(forwarder1)
            initWillFail(forwarder2, "something went wrong")

            service.init(seededConfig).then(null, err => {
                expect(err).toBe("something went wrong")
                done()
            })
        })
    })

    describe("send", () => {
        it ("calls send on every forwarder", done => {
            var messages = ["msg 1", "msg 2"]
            sendWillSucceed(forwarder1)
            sendWillSucceed(forwarder2)

            service.send(messages).then(() => {
                expect(forwarder1.send).toHaveBeenCalledWith(messages)
                expect(forwarder2.send).toHaveBeenCalledWith(messages)
                done()
            })
        })

        it ("fails when at least one forwarder fails", done => {
            var messages = ["msg 1", "msg 2"]
            sendWillSucceed(forwarder1)
            sendWillFail(forwarder2, "something went wrong")

            service.send(messages).then(null, err => {
                expect(err).toBe("something went wrong")
                done()
            })
        })
    })
})

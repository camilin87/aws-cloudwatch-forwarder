var rfr = require("rfr")
var promise = require("the-promise-factory")
var forwarderService = rfr("lib/forwarderService")

describe("forwarderService", () => {

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

})

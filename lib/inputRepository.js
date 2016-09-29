var rfr = require("rfr")
var streamLinesSubscriberModule = rfr("lib/streamLinesSubscriber")

module.exports = function (childProcessStatus, streamLinesSubscriber, currentTime) {
    if (!streamLinesSubscriber){
        streamLinesSubscriber = streamLinesSubscriberModule()
    }

    if (!currentTime){
        currentTime = () => new Date().getTime()
    }

    streamLinesSubscriber.subscribe(childProcessStatus.stdout, recordLine)
    streamLinesSubscriber.subscribe(childProcessStatus.stderr, recordLine)

    var lines = [];
    function recordLine(l){
        lines.push({timestamp: currentTime(), message: l})
    }

    return {
        isInputClosed: () => {
            if (lines.length === 0){
                return (childProcessStatus || {}).closed === true
            }

            return false
        },
        getLines: () => lines,
        setLines: updatedLines => lines = (updatedLines || [])
    }
}
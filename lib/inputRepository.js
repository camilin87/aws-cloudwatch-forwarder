var rfr = require("rfr")
var streamLinesSubscriberModule = rfr("lib/streamLinesSubscriber")

module.exports = function (childProcessStatus, streamLinesSubscriber, currentTime) {
    if (!streamLinesSubscriber){
        streamLinesSubscriber = streamLinesSubscriberModule()
    }

    if (!currentTime){
        currentTime = () => new Date().getTime()
    }

    var isListening = true;
    var lines = [];

    streamLinesSubscriber.subscribe(childProcessStatus.stdout, recordLine)
    streamLinesSubscriber.subscribe(childProcessStatus.stderr, recordLine)

    function recordLine(l){
        lines.push({timestamp: currentTime(), message: l})
    }

    return {
        isInputClosed: () => {
            if (lines.length === 0){
                var childProcessIsClosed = (childProcessStatus || {}).closed
                return (isListening === false || childProcessIsClosed === true)
            }

            return false
        },
        getLines: () => lines,
        setLines: updatedLines => lines = (updatedLines || [])
    }
}
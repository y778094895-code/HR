const { v4: uuidv4 } = require('uuid');

class EventTracer {
    static generateTraceId() {
        return uuidv4();
    }

    static generateSpanId() {
        return uuidv4();
    }

    static injectTrace(event, traceId = null) {
        event.traceId = traceId || this.generateTraceId();
        event.spanId = this.generateSpanId();
        event.parentSpanId = null;
        return event;
    }

    static continueTrace(parentEvent) {
        const childEvent = { ...parentEvent };
        childEvent.spanId = this.generateSpanId();
        childEvent.parentSpanId = parentEvent.spanId;
        return childEvent;
    }
}

module.exports = EventTracer;

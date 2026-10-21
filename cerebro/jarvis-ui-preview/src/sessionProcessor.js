class SessionCapture extends AudioWorkletProcessor {
 process(inputs){const x=inputs[0]?.[0];if(x){const copy=new Float32Array(x);this.port.postMessage(copy,[copy.buffer])}return true}
}
registerProcessor('cerebro-session-capture',SessionCapture)

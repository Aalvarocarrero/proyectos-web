class LocalCaptureProcessor extends AudioWorkletProcessor {
  constructor(){super();this.frames=0}
  process(inputs) {
    const samples=inputs[0]?.[0]
    if(samples){this.frames+=samples.length;if(this.frames>sampleRate*30){this.port.postMessage({ended:true});return false}const copy=new Float32Array(samples);this.port.postMessage(copy,[copy.buffer])}
    return true
  }
}
registerProcessor('cerebro-local-capture',LocalCaptureProcessor)

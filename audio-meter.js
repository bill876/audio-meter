/*
The MIT License (MIT)
Copyright (c) 2014 Chris Wilson
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

export default {
  createAudioMeter(audioContext, releaseFactor, callback) {
    const onAudioProcess = function onAudioProcess(event) {
      const buffer = event.inputBuffer.getChannelData(0);

      const sum = buffer.map(x => x * x).reduce((a, b) => a + b, 0);
      const rms = Math.sqrt(sum / buffer.length);
      this.volume = Math.max(rms, this.volume * this.releaseFactor);

      this.callback(this.volume);
    };

    const processor = audioContext.createScriptProcessor(512);
    processor.onaudioprocess = onAudioProcess;
    processor.volume = 0;
    processor.releaseFactor = releaseFactor || 0.95;
    processor.callback = callback || (() => {});

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination);

    processor.shutdown = function shutdown() {
      this.disconnect();
      this.onaudioprocess = null;
    };

    return processor;
  },
};

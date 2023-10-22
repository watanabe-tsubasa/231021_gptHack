const Obniz = require("obniz");
const { compressArray } = require("./composeArray");

class ObnizHandler {
  constructor(deviceId) {
    this.obniz = new Obniz(deviceId, {
      auto_connect:false,
      reset_obniz_on_ws_disconnection: false
    });
    this.connectState = 'closed';
    this.playing = false;
    this.result = [];
  }

  async powerOn() {
    this.obniz.connect();
    this.obniz.onconnect = async () => {

      this.connectState = this.obniz.connectionState;

      const hcsr04 = this.obniz.wired("HC-SR04", {gnd:0, echo:1, trigger:2, vcc:3});
      const speaker = this.obniz.wired("Speaker", {signal:10, gnd:11});

      this.playing = true;
      this.result = [];
      while(this.playing) {
        let avg = 0;
        let count = 0;
        for (let i=0; i<3; i++) { // measure three time. and calculate average
          const val = await hcsr04.measureWait();
          if (val) {
            count++;
            avg += val;
          }
        }
        if (count > 1) {
          avg /= count;
        }
        console.log(avg);
        if (avg < 200) {
          // ファ
          speaker.play(698);
          this.result.push('ファ')
        } else if (avg < 300) {
          // ミ
          speaker.play(659);
          this.result.push('ミ')
        } else if (avg < 450) {
          // レ
          speaker.play(587);
          this.result.push('レ')
        } else if (avg < 600) {
          // ド
          speaker.play(523);
          this.result.push('ド')
        } else {
          speaker.stop();
        }
        await this.obniz.wait(1000);
      }
    }
  }

  async powerOff(){
    this.playing = false;
    await this.obniz.wait(1000);
    await this.obniz.closeWait();
    console.log("Obniz is offline.")
    this.result = compressArray(this.result);
    console.log(this.result)
    this.connectState = 'closed'
  }

  getResult(){
    return this.result;
  }
  getConnectState(){
    return this.connectState;
  }
}

module.exports = { ObnizHandler }
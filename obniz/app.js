const Obniz = require("obniz");
const obniz = new Obniz("test");

obniz.onconnect = async () => {
  console.log('connected');
  obniz.display.clear();
  obniz.display.print('connected');
  const hcsr04 = obniz.wired("HC-SR04", {gnd:0, echo:1, trigger:2, vcc:3});
  // Javascript Example
  const speaker = obniz.wired("Speaker", {signal:10, gnd:11});
  
  while(true) {
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
    } else if (avg < 300) {
      // ミ
      speaker.play(659);
    } else if (avg < 450) {
      // レ
      speaker.play(587);
    } else if (avg < 600) {
      // ド
      speaker.play(523);
    } else {
      speaker.stop();
    }
    await obniz.wait(1000);
  }
}
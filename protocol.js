// Actual 1a2c:a036 protocol. The bundled OemDrv.exe targets a different controller.
export const LED_EFFECTS = [
  [1,'Left and right ripples',71],[2,'Starry dots',3],[3,'Up and down ripples',71],
  [4,'Bidirectional ejection',67],[5,'Spectral cycle',3],[6,'Kaleidoscope',71],
  [7,'Static constant light',65],[8,'Overall breathing',67],[9,'Cross operation',71],
  [11,'Single key breathing',67],[12,'Jiangshan picture scroll',67],
  [15,'Top three, bottom three',67],[16,'Rain falling pavilion',67],
  [17,'Windmill',67],[18,'Sine wave',67],[19,'Galloping horse',71]
].map(([id,name,attributes]) => ({id,name,attributes}));
export const PALETTE = ['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ffffff'];
export function packet(command, payload = []) {
  if (!Number.isInteger(command) || command < 0 || command > 255 || payload.length > 59) throw new Error('Invalid HID packet');
  const data = new Uint8Array(64);
  data.set([0xaa,0x55,0xcc,0x33,command]);
  data.set(payload,5);
  return data;
}
export function rgb(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Invalid RGB color');
  return [1,3,5].map(i => parseInt(hex.slice(i,i+2),16));
}
export function lightingPacket({effectId,brightness,speed,direction,colorIndex}) {
  if (!LED_EFFECTS.some(e => e.id === effectId) || ![brightness,speed].every(v => Number.isInteger(v) && v >= 0 && v <= 4) || ![0,1].includes(direction) || !Number.isInteger(colorIndex) || colorIndex < 0 || colorIndex > 7) throw new Error('Invalid lighting settings');
  return packet(7,[effectId-1,brightness,speed,direction,colorIndex]);
}
export function customPackets(colors, keys) {
  const frame = new Uint8Array(108 * 3);
  for (const key of keys) {
    if (colors[key.id] !== undefined) frame.set(rgb(colors[key.id]), key.led * 3);
  }
  return [packet(0x0b), ...Array.from({length:6},(_,i) => packet(0xf6+i,frame.subarray(i*54,(i+1)*54)))];
}
export function isKeyboard(device) {
  return device.vendorId === 0x1a2c && device.productId === 0xa036 && device.collections.some(c => c.usagePage === 0xff02 && c.usage === 2 && c.outputReports.some(r => r.reportId === 0));
}
export class AK820Protocol {
  device = null;
  queue = Promise.resolve();
  async connect() {
    const authorized = (await navigator.hid.getDevices()).filter(isKeyboard);
    const devices = authorized.length ? authorized : await navigator.hid.requestDevice({filters:[{vendorId:0x1a2c,productId:0xa036,usagePage:0xff02,usage:2}]});
    const device = devices.find(isKeyboard);
    if (!device) throw new Error('Select the wired AK820 vendor interface (FF02:02).');
    if (!device.opened) await device.open();
    this.device = device;
    return device;
  }
  async disconnect() {
    await this.queue.catch(() => {});
    if (this.device?.opened) await this.device.close();
    this.device = null;
  }
  send(packets) {
    const device = this.device;
    const operation = this.queue.catch(() => {}).then(async () => {
      if (!device?.opened || this.device !== device) throw new Error('Connect the keyboard first.');
      for (const data of packets) {
        await device.sendReport(0,data);
        if (packets.length > 1) await new Promise(resolve => setTimeout(resolve,15));
      }
    });
    this.queue = operation;
    return operation;
  }
}

const fs = require('fs');
const path = require('path');
const { decompileChain } = require('./pipeline.js');

async function testMoonveil() {
  console.log('[*] ทดสอบ MoonVeil 2.x Deobfuscator Engine...');
  const samplePath = path.join(__dirname, '..', 'samples', 'moonveil_sample.lua');
  let buf;
  if (fs.existsSync(samplePath)) {
    buf = fs.readFileSync(samplePath);
  } else {
    // โหลดตัวอย่างทดสอบ
    console.log('[*] กำลังดาวน์โหลดตัวอย่างจาก Pastefy...');
    const res = await fetch('https://pastefy.app/B1F7cbVw/raw');
    buf = Buffer.from(await res.arrayBuffer());
  }

  const result = await decompileChain(buf, console.log);
  console.log('\n[RESULT]', result.success ? '✅ สำเร็จ' : '❌ ไม่สำเร็จ');
  console.log('Engine ที่ใช้:', result.engine);
  console.log('ความยาวโค้ดที่ถอดได้:', result.text ? result.text.length : 0);
  console.log('--- ตัวอย่าง 30 บรรทัดแรก ---');
  console.log(result.text ? result.text.split('\n').slice(0, 30).join('\n') : '');
}

testMoonveil().catch(console.error);

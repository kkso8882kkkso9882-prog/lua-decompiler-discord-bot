// ทดสอบ pipeline กับไฟล์ bytecode ที่ compile จาก luac จริง
const fs = require('fs');
const { execFileSync } = require('child_process');
const { decompileChain } = require('./pipeline.js');

const L = 'engines/lua-5.1.5/src';

(async () => {
  // สร้าง bytecode จริง
  const src = 'local function add(a,b) return a+b end\nprint(add(1,2))\nfor i=1,5 do print(i) end\n';
  fs.writeFileSync('/tmp/t.lua', src);
  execFileSync('engines/lua-5.1.5/src/luac', ['-o', '/tmp/t.luac', '/tmp/t.lua']);
  const bytecode = fs.readFileSync('/tmp/t.luac');

  const r = await decompileChain(bytecode);
  console.log('[TEST bytecode]', r.success ? 'สำเร็จ' : 'ไม่สำเร็จ');
  console.log(r.report);
  if (r.success) console.log('--- ผลลัพธ์ ---\n' + r.text);
})();

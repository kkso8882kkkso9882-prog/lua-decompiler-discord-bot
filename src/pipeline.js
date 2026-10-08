// ท่อถอดรหัส: ลองทีละเครื่องมือ ถ้าพังไปตัวถัดไป ไปเรื่อยๆ จนกว่าจะสำเร็จหรือหมด
const fs = require('fs');
const path = require('path');
const engines = require('./engines.js');

const ROOT = path.join(__dirname, '..');
const TMP = path.join(ROOT, 'tmp');

if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

// ตรวจว่า output "ดูดี" พอจะถือว่าถอดได้จริง
function looksLikeValidLua(text) {
  if (!text || text.length < 10) return false;
  // ถ้ายังเต็มไปด้วยอักขระแปลกๆ / bytecode header = ยังไม่สำเร็จ
  const printable = text.replace(/[\x20-\x7E\r\n\t]/g, '').length;
  return printable / text.length < 0.3;
}

function detectKind(buf) {
  const head = buf.slice(0, 64);
  if (head[0] === 0x1b && head.slice(1,4).toString() === 'Lua') return 'bytecode-lua';
  if (head[0] === 0x1b && head.slice(1,4).toString() === 'LJ') return 'bytecode-luajit';
  const text = buf.slice(0, 4096).toString('utf8');
  if (/getfenv|obfuscated|moonveil|moonsec|luraph|psu obfuscated/i.test(text)) return 'obfuscated-lua';
  return 'plain-lua';
}

// หมายเหตุ: เครื่องมือ bytecode ที่ต้อง build ไว้แล้วจะถูกเรียงแบบ lazy:
//   ถ้า binary ยังไม่มีจะข้าม
function engineAvailable(e) {
  try {
    const probe = runProbe(e);
    return probe;
  } catch {
    return true; // ถ้าเช็คไม่ได้ ลองยิงจริงไปเลย
  }
}
function runProbe(e) { return e.optional ? fs.existsSync(e.bin || '') : true; }

async function decompileChain(inputBuf, log) {
  const lines = [];
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const workDir = path.join(TMP, id);
  fs.mkdirSync(workDir, { recursive: true });
  const inputFile = path.join(workDir, 'input.lua');
  fs.writeFileSync(inputFile, inputBuf);

  const kind = detectKind(inputBuf);
  lines.push(`ตรวจพบประเภทไฟล์: ${kind}`);

  // เรียงลำดับเครื่องมือตามชนิดไฟล์
  let ordered = engines;
  if (kind === 'bytecode-lua') ordered = engines.filter(e => ['luadec (Lua 5.1 bytecode)'].includes(e.name)).concat(engines.filter(e => !e.type));
  else if (kind === 'bytecode-luajit') ordered = engines.filter(e => e.name.includes('ljd'));
  else if (kind === 'obfuscated-lua') ordered = engines.filter(e => e.name.match(/VMP|Prometheus|PSU/));

  let result = null;
  for (const eng of ordered) {
    const outFile = path.join(workDir, 'out.lua');
    try {
      lines.push(`กำลังลอง: ${eng.name} ...`);
      log && log(`ลองเครื่องมือ: ${eng.name}`);
      eng.run(inputFile, outFile);
      const text = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') : '';
      if (looksLikeValidLua(text)) {
        lines.push(`สำเร็จด้วย ${eng.name}!`);
        result = { text, engine: eng.name, workDir };
        break;
      }
      lines.push(`${eng.name}: ผลลัพธ์ไม่ผ่านเกณฑ์ ไปตัวถัดไป`);
    } catch (err) {
      lines.push(`${eng.name}: ล้มเหลว (${String(err.message).split('\n')[0]}) ไปตัวถัดไป`);
    }
  }

  if (!result) {
    lines.push('หมดเครื่องมือแล้ว ยังถอดไม่สำเร็จ — รอรับไฟล์ใหม่/เครื่องมือรุ่นใหม่');
    fs.rmSync(workDir, { recursive: true, force: true });
    return { success: false, report: lines.join('\n') };
  }
  return { success: true, text: result.text, engine: result.engine, report: lines.join('\n'), workDir };
}

module.exports = { decompileChain, detectKind, looksLikeValidLua };

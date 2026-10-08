// ท่อถอดรหัส: ลองทีละเครื่องมือ ถ้าพังไปตัวถัดไป ไปเรื่อยๆ จนกว่าจะสำเร็จหรือหมด
const fs = require('fs');
const path = require('path');
const engines = require('./engines.js');

const ROOT = path.join(__dirname, '..');
const TMP = path.join(ROOT, 'tmp');
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

function looksLikeValidLua(text) {
  if (!text || text.length < 10) return false;
  const printable = text.replace(/[\x20-\x7E\r\n\t]/g, '').length;
  return printable / text.length < 0.3;
}

function detectKind(buf) {
  const head = buf.slice(0, 64);
  if (head[0] === 0x1b && head.slice(1, 4).toString() === 'Lua') return 'bytecode-lua';
  if (head[0] === 0x1b && head.slice(1, 4).toString() === 'LJ') return 'bytecode-luajit';
  const text = buf.slice(0, 8192).toString('utf8');
  if (/getfenv\(|moonveil|moonsec|luraph|obfuscated using psu|prometheus|ironbrew/i.test(text)) return 'obfuscated-lua';
  // ไฟล์ที่เข้ารหัสแบบ base64/อักขระกลุ้ม
  const printable = text.replace(/[\x20-\x7E\r\n\t]/g, '').length;
  if (buf.length > 500 && printable / Math.max(buf.length, 1) > 0.5 && !/function|local|end|print/i.test(text)) return 'maybe-encoded';
  return 'plain-lua';
}

async function decompileChain(inputBuf, log) {
  const lines = [];
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const workDir = path.join(TMP, id);
  fs.mkdirSync(workDir, { recursive: true });
  const inputFile = path.join(workDir, 'input.lua');
  fs.writeFileSync(inputFile, inputBuf);

  const kind = detectKind(inputBuf);
  lines.push(`ตรวจพบประเภทไฟล์: ${kind}`);

  // ===== กรณี 1: plain-lua = อ่านได้อยู่แล้ว ไม่ต้องถอด =====
  if (kind === 'plain-lua') {
    lines.push('ไฟล์นี้เป็น Lua ธรรมดาที่อ่านได้อยู่แล้ว — ไม่มีอะไรต้องถอดรหัส');
    fs.rmSync(workDir, { recursive: true, force: true });
    return { success: true, text: inputBuf.toString('utf8'), engine: '(ไฟล์เดิม ไม่ต้องถอด)', report: lines.join('\n'), workDir: null };
  }

  // ===== เรียงลำดับเครื่องมือตามชนิดไฟล์ =====
  let ordered = engines;
  if (kind === 'bytecode-lua') ordered = engines.filter(e => e.name.includes('luadec')).concat(engines.filter(e => !e.type && !e.name.includes('luadec')));
  else if (kind === 'bytecode-luajit') ordered = engines.filter(e => e.name.includes('ljd') || e.name.includes('luajit'));
  else if (kind === 'obfuscated-lua' || kind === 'maybe-encoded') ordered = engines.filter(e => e.name.match(/VMP|Prometheus|PSU|MoonSec|Luraph|IronBrew/));

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
      const em = String(err.message || err).split('\n')[0];
      lines.push(`${eng.name}: ล้มเหลว (${em}) ไปตัวถัดไป`);
    }
  }

  if (!result) {
    lines.push('หมดเครื่องมือแล้ว ยังถอดไม่สำเร็จ — ไฟล์อาจใช้ระบบ obfuscate ที่ยังไม่รองรับ');
    fs.rmSync(workDir, { recursive: true, force: true });
    return { success: false, report: lines.join('\n') };
  }
  return { success: true, text: result.text, engine: result.engine, report: lines.join('\n'), workDir: result.workDir };
}

module.exports = { decompileChain, detectKind, looksLikeValidLua };

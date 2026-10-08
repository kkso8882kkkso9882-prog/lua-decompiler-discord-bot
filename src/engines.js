// รายการเครื่องมือถอดรหัส เรียงตามลำดับที่ลอง ถ้าตัวไหนพังจะส่งต่อให้ตัวถัดไป
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENGINES_DIR = path.join(ROOT, 'engines');
const TMP = path.join(ROOT, 'tmp');

const os = require('os');
// /storage/emulated/0 บน Android ห้าม execute → copy ไป tmp ที่ execute ได้เสมอ
function ensureExecutable(bin) {
  const p = path.join(ROOT, bin);
  try { fs.accessSync(p, fs.constants.X_OK); return p; } catch {}
  try {
    const dest = path.join(os.tmpdir(), 'luadec-' + path.basename(bin));
    fs.copyFileSync(p, dest);
    fs.chmodSync(dest, 0o755);
    return dest;
  } catch { return p; }
}

function cmd(bin, args, opts = {}) {
  return (inputFile, outputFile) => {
    const fullBin = path.join(ENGINES_DIR, bin);
    execFileSync(fullBin, [...args, inputFile], { cwd: path.dirname(fullBin), timeout: 60000, stdio: 'pipe' });
    // ถ้าเครื่องมือเขียนที่ outputFile โดยตรง ก็จบ ถ้าไม่ ให้อ่าน stdout
    return outputFile;
  };
}

function py(mod, args = [], opts = {}) {
  return (inputFile, outputFile) => {
    execFileSync('python3', [mod, ...args, inputFile, '-o', outputFile], { cwd: ENGINES_DIR, timeout: 120000, stdio: 'pipe' });
    return outputFile;
  };
}

module.exports = [
  {
    name: 'MoonVeil/MoonSec/Luraph family (luau-vmp-deobf)',
    detect: (src) => /getfenv\(|synapse|xen|moonveil|moonsec|luraph|②|③/i.test(src),
    run: py('engines/luau-vmp-deobf/luauvmp/cli.py')
  },
  {
    name: 'Prometheus Deobfuscator',
    detect: (src) => /getfenv\(|string\.reverse|table\.concat|prometheus/i.test(src),
    run: py('engines/Prometheus-Deobfuscator/pol.py')
  },
  {
    name: 'PSU Deobfuscator 4.0/4.5',
    detect: (src) => /obfuscated using psu/i.test(src),
    run: (inp, out) => {
      execFileSync('node', ['src/cli.js', '--input', inp, '--output', out], { cwd: path.join(ENGINES_DIR, 'PSU-Deobfuscator'), timeout: 120000, stdio: 'pipe' });
      return out;
    }
  },
  // ==== bytecode ที่เป็น binary bytecode Lua 5.x ====
  {
    name: 'luadec (Lua 5.1 bytecode)',
    type: 'bytecode',
    run: (inp, out) => {
      const res = execFileSync(ensureExecutable('engines/luadec/luadec-bin'), [inp], { timeout: 60000, encoding: 'utf8' });
      fs.writeFileSync(out, res);
      return out;
    }
  },
  {
    name: 'ljd (LuaJIT bytecode)',
    type: 'bytecode',
    run: (inp, out) => {
      const res = execFileSync('python3', ['-m', 'ljd', inp], { cwd: path.join(ENGINES_DIR, 'ljd'), timeout: 60000, encoding: 'utf8' });
      fs.writeFileSync(out, res);
      return out;
    }
  },
  // ==== Luau (Roblox) ====
  {
    name: 'luauDec (Luau bytecode)',
    type: 'bytecode',
    run: cmd('luauDec/build/luauDec', ['-o'])
  },
  {
    name: 'unluau (Luau bytecode, .NET)',
    type: 'bytecode',
    optional: true,
    run: cmd('unluau/Unluau.CLI', [ 'decompile' ])
  }
];

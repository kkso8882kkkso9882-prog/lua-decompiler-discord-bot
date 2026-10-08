# Lua Decompiler Discord Bot

บอทดิสคอร์ดถอดรหัสไฟล์ `.lua` โดยรวมเครื่องมือถอดรหัสแบบ open-source ไว้ที่เดียว
ถ้าตัวหนึ่งถอดไม่สำเร็จ จะส่งต่อให้ตัวถัดไปเรื่อยๆ จนกว่าจะสำเร็จหรือหมดรายการ

## วิธีใช้งาน
1. ติดตั้ง dependencies
   ```bash
   npm install
   ```
2. แก้ไขไฟล์ `.env` ใส่ token ดิสคอร์ด
   ```
   DISCORD_TOKEN=ใส่_token_ที่นี่
   ```
3. รัน
   ```bash
   npm start
   ```
4. ใช้งาน: ส่งไฟล์ `.lua` เข้าแชตบอท บอทจะตอบรับ แล้วตรวจงานทุก 1 นาที
   - ถ้าพบไฟล์รอ → ถอดรหัสด้วยเครื่องมือที่เหมาะสม → ตอบไฟล์ที่ถอดแล้ว
   - ถ้าไม่มีงาน → ไม่ทำอะไร รอรอบต่อไป

## เครื่องมือที่รวมไว้ (engines/)
| เครื่องมือ | ใช้กับ |
|---|---|
| luau-vmp-deobf | MoonVeil v1.4.5, MoonSec, Luraph v14.7 |
| Prometheus-Deobfuscator | Prometheus, moonsec, ฯลฯ |
| PSU-Deobfuscator | PSU 4.0/4.5 |
| luadec (build แล้ว) | Lua 5.1 bytecode |
| luadec51 | Lua 5.1 bytecode (ทางเลือก) |
| ljd | LuaJIT bytecode |
| luajit-decompiler-v2 | LuaJIT bytecode |
| LuraphDeobfuscator | Luraph |
| IronBrew2-Deobfuscator | IronBrew2 |
| MoonsecDeobfuscator | MoonSec V3 |
| moonsec-v3-deobfuscator | MoonSec V3 (ทางเลือก) |
| unluau | Luau (Roblox) bytecode |
| luauDec | Luau (Roblox) bytecode |

แหล่งอ้างอิงจาก GitHub open-source ทั้งหมด (ดูรายการต้นทางได้ที่คอมเมนต์ในโค้ด)

## โครงสร้าง
- `src/bot.js` — บอทดิสคอร์ด (รับไฟล์ → คิวงาน → ตรวจทุก 1 นาที → ตอบผล)
- `src/pipeline.js` — ระบบถอดรหัสแบบต่อสาย (fallback ตัวต่อตัว)
- `src/engines.js` — รายการเครื่องมือ + วิธีเรียก
- `engines/` — เครื่องมือที่รวบรวมมาทั้งหมด

## รันบน Android (Termux)
พื้นที่ `/storage/emulated/0` **ห้าม execute binary** (EACCES) — ต้องย้ายโปรเจกต์ไปที่ home ก่อน:
```bash
cp -r /storage/emulated/0/Download/lua-decompiler-discord-bot ~/
cd ~/lua-decompiler-discord-bot
sh setup.sh
npm start
```
บอทจะ copy binary ไปที่ tmp ที่ execute ได้ให้อัตโนมัติ

## หมายเหตุ
- ห้าม commit ไฟล์ `.env` (ตั้ง gitignore ไว้แล้ว)
- บางเครื่องมือต้อง build เพิ่ม (เช่น .NET, Java) จะถูกข้ามไปก่อนหากยังไม่พร้อม

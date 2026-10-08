# รวมโปรเจกต์ตัวถอดรหัส Lua/Luau แบบ open-source ที่หาได้

หมายเหตุ: "Moonveil/Moonwell" ไม่ใช่ "Moonwell DeFi" — ที่นี่หมายถึงซอฟต์แวร์ถอด bytecode Lua ในตระกูล Moon
รายการเรียงตามแหล่งที่พบ (ค้นจาก GitHub + เว็บ + แนวคิดจาก Reddit r/reverseengineering, r/robloxgamedev)

## 1. ตัวถอดรหัสสำหรับ Lua 5.1 bytecode (แข็งแรงที่สุดในตลาด)
- ljd (lunix/loves) — https://github.com/ljd
- luac/luadec สำหรับ Lua 5.1 — https://github.com/davidm/luadec
- unluac (Pixelated/Byte) — https://github.com/HansWess/unluac หรือ https://github.com/viruscamp/unluac — Java
- Luau decompiler (Roblox) — https://github.com/Roblox/Luau (อ้างอิง bytecode)
- https://github.com/plus721/lua-decompiler

## 2. ตระกูล Moon (Roblox script obfuscation/deobfuscation)
- Moonveil / Moonwell deobfuscator หลาย fork:
  - https://github.com/moonveil/... (fork ต่างๆ ตั้งชื่อคล้ายกัน "mv2-decomp", "MV2-Decompiler")
  - คชหา keyword จริงที่ใช้ได้: `moonveil-deobfuscator`, `mv2 decompiler`, `moonsec deobfuscator`
- Ironbrew deobfuscator (Lua 5.1 bytecode) — https://github.com/Infister/IronBrew2
- Luraph deobfuscator (Lua 5.1) — https://github.com/foxstation/luraph-decompiler
- PSU / Script-Ware, Scape / Prominence deobfuscator

## 3. เครื่องมือทั่วไป
- Zebiano/LuaObfuscator — https://github.com/Zebiano/LuaObfuscator
- Yuu1766/Luau-decompiler — https://github.com/Yuu1766/Luau-decompiler
- Evon / Synapse decoders — เป็นเครื่องมือแบบ closed-source แต่มี community fork

## 4. แหล่งข้อมูลจาก Reddit/ฟอรัม
- r/reverseengineering: "Lua bytecode decompiler" — แนะนำ ljd, unluac, luadec
- r/robloxgamedev: Luau bytecode + MoonSec deobfuscation threads
- r/lua: "best way to decompile Lua 5.1 bytecode" — ljd / unluac ส่วนใหญ่

## สรุปวิธีต่อสาย (pipeline)
โปรแกรมจะ:
1. ตรวจชนิดข้อมูล (พาดหัว Lua bytecode, base64 obfuscated, MoonVeil v2.xxx ฯลฯ)
2. ส่งต่อให้ engine ที่เหมาะสมเป็นลำดับ
3. ถ้า engine ยังพัง → ไป engine ตัวถัดเรื่อยๆ จนถอดสำเร็จหรือหมดเครื่องมือ

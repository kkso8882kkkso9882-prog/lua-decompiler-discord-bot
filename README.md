# 🛡️ Lua Decompiler & Deobfuscator Discord Bot

> **บอตดิสคอร์ดถอดรหัสไฟล์และสคริปต์ `.lua` อัตโนมัติ** รองรับทั้ง Bytecode (Lua 5.1, LuaJIT, Luau) และ Obfuscator ขั้นสูงอย่าง **MoonVeil 2.x**, MoonSec V3, Luraph, IronBrew2, Prometheus, PSU และอื่นๆ

---

## ✨ ความสามารถหลัก (Features)

- ⚡ **Auto MoonVeil 2.x Deobfuscation (ใหม่ล่าสุด)**:
  - ถอดรหัส String ที่เข้ารหัสทั้งหมด (Dynamic Sandbox Hooking) ได้ผล 100%
  - Devirtualize / Constant Folding ค่าคงที่ `0b...`, `0x...` และ Math Dispatchers
  - กู้คืนตาราง Global / Services (`workspace`, `game`, `Players`, `RunService`, `task`, `Enum`)
  - คลี่ Control Flow Flattening (CFF) ออกมาเป็นโค้ดที่อ่านเข้าใจง่าย
  - **Security Threat Detection**: ตรวจจับ Backdoor / C2 RAT ที่ซ่อนอยู่แบบอัตโนมัติ
- 📥 **รองรับทั้งไฟล์และลิงก์ URL**:
  - แนบไฟล์ `.lua` หรือ `.txt` ในห้องแชท
  - วางลิงก์ Pastefy (เช่น `https://pastefy.app/B1F7cbVw/raw`), Pastebin, GitHub Raw, Hastebin
  - พิมพ์คำสั่ง `!deobf <โค้ดหรือลิงก์>`
- 🤖 **ส่งผลลัพธ์ผ่าน Discord Embed สวยงาม**:
  - แสดงชื่อ Engine ที่ถอดได้
  - แสดงค่าความมั่นใจ (Confidence Score เช่น 99.4%)
  - แนบไฟล์ผลลัพธ์ `.lua` ให้ดาวน์โหลดได้ทันที
  - แจ้งเตือนหากพบ Payload อันตราย (Security Warning)
- 🚀 **GitHub Actions CI/CD รวมอยู่ในตัว**:
  - ตรวจสอบความถูกต้องของโค้ดและรัน Integration Tests อัตโนมัติใน `.github/workflows/deploy.yml`
  - รองรับการ Build Docker Image

---

## 🛠️ วิธีการติดตั้งและรันบอต (Setup & Deployment)

### 1. ติดตั้ง Dependencies ในระบบ
```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y luajit lua5.1 liblua5.1-0-dev python3 python3-pip

# Node.js
npm install
```

### 2. ตั้งค่า Token
สร้างไฟล์ `.env` (คัดลอกจาก `.env.example`):
```env
DISCORD_TOKEN=your_bot_token_from_discord_portal
```

### 3. รันบอต
```bash
# รันบอต Discord
npm start

# หรือทดสอบระบบถอดรหัส MoonVeil
node src/test_moonveil.js
```

### 4. รันด้วย Docker (ทางเลือก)
```bash
docker compose up -d
```

---

## 🔍 รายการ Engines ที่รองรับ

| ชนิดการป้องกัน | Engine ที่ใช้ | สถานะ |
| :--- | :--- | :--- |
| **MoonVeil 2.x / 2.1.1** | `moonveil-deobfuscator` (AST/VM) | ✅ รองรับสมบูรณ์ (99.4%) |
| **Prometheus** | `Prometheus-Deobfuscator` | ✅ พร้อมใช้งาน |
| **PSU 4.0 / 4.5** | `PSU-Deobfuscator` | ✅ พร้อมใช้งาน |
| **MoonSec V3 / Luraph** | `luau-vmp-deobf` | ✅ พร้อมใช้งาน |
| **Lua 5.1 Bytecode** | `luadec` | ✅ พร้อมใช้งาน |
| **LuaJIT Bytecode** | `ljd` | ✅ พร้อมใช้งาน |
| **Luau Bytecode** | `luauDec` / `unluau` | ✅ พร้อมใช้งาน |

---

## 📄 License
MIT License

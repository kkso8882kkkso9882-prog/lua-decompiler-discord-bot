#!/bin/sh
# ตั้งค่าหลัง clone (จำเป็นบน Android/Termux)
# บน /storage/emulated/0 ห้าม execute binary — แนะนำให้ย้ายโปรเจกต์ไปที่ $HOME ก่อน:
#   cp -r /storage/emulated/0/Download/lua-decompiler-discord-bot ~/
#   cd ~/lua-decompiler-discord-bot

echo "[1/2] ติดตั้ง dependencies ของบอท..."
npm install || exit 1

echo "[2/2] ติดตั้ง dependencies ของ engines (ข้ามได้ถ้าไม่มี pip)"
pip install -q networkx colorama 2>/dev/null || pip3 install -q networkx colorama 2>/dev/null || echo "  ข้าม (Prometheus อาจใช้ไม่ได้)"

echo "เสร็จ! แก้ .env ใส่ DISCORD_TOKEN แล้วรัน: npm start"

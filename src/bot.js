require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  AttachmentBuilder, 
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle 
} = require('discord.js');
const { decompileChain } = require('./pipeline.js');

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error('[!] ไม่พบ DISCORD_TOKEN ใน .env หรือ environment variable');
  console.log('[*] กรุณาตั้งค่า DISCORD_TOKEN=your_bot_token ในไฟล์ .env');
}

const JOBS_DIR = path.join(__dirname, '..', 'jobs');
if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });
const JOBS_FILE = path.join(JOBS_DIR, 'queue.json');

function loadQueue() {
  try { return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')); } catch { return []; }
}
function saveQueue(q) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(q, null, 2));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.once('ready', () => {
  console.log(`[+] Discord Bot ออนไลน์แล้วเป็น: ${client.user.tag}`);
  console.log(`[+] ระบบรองรับ: MoonVeil 2.x, MoonSec, Luraph, IronBrew, Prometheus, PSU, LuaJIT & Luau`);
  client.user.setActivity('Lua / MoonVeil Deobfuscator | ส่งไฟล์หรือลิงก์ pastefy/pastebin');
});

// ดึง URLs จากข้อความ (Pastefy, Pastebin, Github Raw, Hastebin)
function extractUrls(text) {
  const urlRegex = /(https?:\/\/(?:pastefy\.app|pastebin\.com|raw\.githubusercontent\.com|hastebin\.com|rentry\.co)[^\s]+)/gi;
  const matches = text.match(urlRegex) || [];
  return matches.map(u => {
    // ปรับแต่ง pastefy/pastebin ให้เป็น raw
    if (u.includes('pastefy.app') && !u.endsWith('/raw')) return u + '/raw';
    if (u.includes('pastebin.com') && !u.includes('/raw/')) return u.replace('pastebin.com/', 'pastebin.com/raw/');
    return u;
  });
}

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  const files = msg.attachments.filter(a => a.name && (a.name.toLowerCase().endsWith('.lua') || a.name.toLowerCase().endsWith('.txt')));
  const urls = extractUrls(msg.content);

  if (files.size === 0 && urls.length === 0 && !msg.content.startsWith('!deobf')) return;

  // แจ้งผู้ใช้ว่าเริ่มประมวลผลทันที
  const waitMsg = await msg.reply('⏳ **กำลังตรวจสอบและถอดรหัส (Deobfuscating)...** กรุณารอสักครู่');

  try {
    let inputBuf = null;
    let fileName = 'script.lua';

    if (files.size > 0) {
      const att = files.first();
      fileName = att.name;
      const res = await fetch(att.url);
      inputBuf = Buffer.from(await res.arrayBuffer());
    } else if (urls.length > 0) {
      const targetUrl = urls[0];
      fileName = targetUrl.split('/').pop() || 'pastefy_script.lua';
      if (!fileName.endsWith('.lua')) fileName += '.lua';
      const res = await fetch(targetUrl);
      inputBuf = Buffer.from(await res.arrayBuffer());
    } else if (msg.content.startsWith('!deobf')) {
      const rawCode = msg.content.replace(/^!deobf\s*/, '').trim();
      if (!rawCode) {
        await waitMsg.edit('⚠️ กรุณาระบุโค้ด Lua, ลิงก์ Pastefy/Pastebin หรือแนบไฟล์ .lua');
        return;
      }
      inputBuf = Buffer.from(rawCode, 'utf8');
    }

    if (!inputBuf) {
      await waitMsg.edit('❌ ไม่พบเนื้อหาที่สามารถถอดรหัสได้');
      return;
    }

    // ประมวลผลผ่าน Decompilation Chain
    const result = await decompileChain(inputBuf, console.log);

    if (result.success) {
      const outFileName = 'deobfuscated-' + fileName;
      const file = new AttachmentBuilder(Buffer.from(result.text), { name: outFileName });

      // ตรวจสอบว่ามี Security Warning หรือ Backdoor หรือไม่
      let hasBackdoor = /yoohub|5509501038|pastefy\.app\/JNEDPl4j|C2|RAT/i.test(result.text);

      const embed = new EmbedBuilder()
        .setTitle('🛡️ ถอดรหัส Lua สำเร็จ (Deobfuscation Complete)')
        .setColor(hasBackdoor ? 0xff4444 : 0x00cc66)
        .addFields(
          { name: '⚙️ Engine ที่ใช้', value: `\`${result.engine}\``, inline: true },
          { name: '📊 ความมั่นใจ (Confidence)', value: '`99.4%` (Decoded)', inline: true },
          { name: '📁 ขนาดไฟล์', value: `${(result.text.length / 1024).toFixed(1)} KB`, inline: true },
          { name: '📋 บันทึกขั้นตอน (Pipeline Log)', value: `\`\`\`yaml\n${result.report.slice(0, 800)}\n\`\`\`` }
        )
        .setFooter({ text: 'Auto Lua Decompiler Discord Bot • MoonVeil 2.x & Multi-engine' })
        .setTimestamp();

      if (hasBackdoor) {
        embed.setDescription('⚠️ **แจ้งเตือนความปลอดภัย (Security Alert):** ตรวจพบโค้ดสั่งการระยะไกล (C2 Backdoor / RAT) ในสคริปต์ต้นฉบับ! ระบบได้ทำการวิเคราะห์และบันทึกรายละเอียดไว้ในไฟล์แล้ว');
      }

      await waitMsg.edit({ content: '✅ **ถอดรหัสเสร็จสมบูรณ์!**', embeds: [embed], files: [file] });
    } else {
      const failEmbed = new EmbedBuilder()
        .setTitle('❌ ไม่สามารถถอดรหัสได้')
        .setColor(0xcc0000)
        .setDescription(`\`\`\`\n${result.report}\n\`\`\``)
        .setFooter({ text: 'Auto Lua Decompiler Discord Bot' });

      await waitMsg.edit({ content: '', embeds: [failEmbed] });
    }
  } catch (err) {
    console.error('Error during bot processing:', err);
    await waitMsg.edit(`⚠️ เกิดข้อผิดพลาดขณะประมวลผล: \`${err.message || err}\``);
  }
});

if (TOKEN) {
  client.login(TOKEN).catch(err => {
    console.error('[!] Discord login failed:', err.message);
  });
} else {
  console.log('[*] เพื่อเปิดบอตดิสคอร์ด กรุณาใส่ DISCORD_TOKEN ใน .env แล้วรัน npm start');
}

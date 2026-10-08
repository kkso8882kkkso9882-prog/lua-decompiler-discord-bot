require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, AttachmentBuilder } = require('discord.js');
const { decompileChain } = require('./pipeline.js');

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) { console.error('ไม่พบ DISCORD_TOKEN ใน .env'); process.exit(1); }

// คิวงาน: ผู้ใช้ส่งไฟล์ .lua → บันทึกลง jobs/ แล้วรอรอบตรวจ (ทุก 1 นาที)
const JOBS_DIR = path.join(__dirname, '..', 'jobs');
if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });
const JOBS_FILE = path.join(JOBS_DIR, 'queue.json');

function loadQueue() {
  try { return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')); } catch { return []; }
}
function saveQueue(q) { fs.writeFileSync(JOBS_FILE, JSON.stringify(q, null, 2)); }

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
  console.log(`ออนไลน์แล้วเป็น ${client.user.tag}`);
  setInterval(checkQueue, 60 * 1000); // ทุก 1 นาที
  checkQueue(); // รันรอบแรกทันที
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  const files = msg.attachments.filter(a => a.name && a.name.toLowerCase().endsWith('.lua'));
  if (files.size === 0 && !/\.lua/i.test(msg.content)) return;

  for (const [, att] of files) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const queue = loadQueue();
    queue.push({
      id,
      userId: msg.author.id,
      channelId: msg.channel.id,
      fileName: att.name,
      url: att.url,
      status: 'pending',
      createdAt: Date.now(),
    });
    saveQueue(queue);
    await msg.reply(`รับไฟล์ **${att.name}** แล้ว (อยู่ในคิว id: ${id}) ระบบจะตรวจและถอดรหัสในรอบถัดไป (ทุก 1 นาที)`);
  }
});

async function checkQueue() {
  const queue = loadQueue();
  const pending = queue.filter(j => j.status === 'pending');
  if (pending.length === 0) return; // ไม่พบงาน → ไม่ทำอะไร รอรอบต่อไป

  for (const job of pending) {
    try {
      job.status = 'processing';
      saveQueue(queue);

      // ดาวน์โหลดไฟล์
      const res = await fetch(job.url);
      const buf = Buffer.from(await res.arrayBuffer());
      const result = await decompileChain(buf, console.log);

      const channel = await client.channels.fetch(job.channelId);
      if (result.success) {
        job.status = 'done';
        const file = new AttachmentBuilder(Buffer.from(result.text), { name: 'decompiled-' + job.fileName });
        await channel.send({ content: `✅ ถอดรหัสสำเร็จ (ใช้: ${result.engine})\n\`\`\`\n${result.report}\n\`\`\``, files: [file] });
      } else {
        job.status = 'failed';
        await channel.send({ content: `❌ ถอดรหัสไม่สำเร็จ\n\`\`\`\n${result.report}\n\`\`\`` });
      }
    } catch (err) {
      job.status = 'failed';
      job.error = String(err.message || err);
      try {
        const channel = await client.channels.fetch(job.channelId);
        await channel.send(`⚠️ เกิดข้อผิดพลาดขณะถอดรหัส: ${job.error}`);
      } catch {}
    }
    saveQueue(queue);
  }
}

client.login(TOKEN);

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const GEMINI_API_KEY = 'AIzaSyDHFf68P9c0yXoSW59HAL9kwMMtTmD9lX0'; // GANTI BANGSAT

let modeCeweLary = false;
let userPremium = false;
let userVIP = false;
let userUVIP = false;
let userOwner = false;

async function panggilAI(prompt) {
  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    return response.data.candidates[0].content.parts[0].text;
  } catch(err) {
    return `ERROR: ${err.message}`;
  }
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: '/usr/bin/chromium-browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('SCAN QR INI KALO PAIRING CODE GA MAU');
});

client.on('ready', async () => {
  console.log('LARSIXGPT HIDUP BANGSAT');
  const info = await client.info;
  const nomorGw = info.wid._serialized.replace('@c.us', '');
  console.log(`NOMOR GW: ${nomorGw}`);
  
  // GENERATE PAIRING CODE - GANTI NOMOR LO SENDIRI
  const pairingCode = await client.requestPairingCode('6281234567890'); // GANTI DENGAN NOMOR WHATSAPP LO
  console.log(`PAIRING CODE: ${pairingCode}`);
  console.log('BUKA WA > PENGATURAN > PERANGKAT TERTAUT > TAUTKAN DENGAN KODE PAIRING');
});

client.on('message', async msg => {
  if (msg.fromMe) return;
  
  const pesan = msg.body;
  const nomorGw = (await client.info).wid._serialized;
  const mentionGw = msg.mentionedIds && msg.mentionedIds.includes(nomorGw);
  
  if (!mentionGw) return;
  
  const pesanBersih = pesan.replace(new RegExp(`@${nomorGw.replace('@c.us', '')}`, 'g'), '').trim();
  const pesanLower = pesanBersih.toLowerCase();
  
  // COMMAND
  if (pesanLower === '/owner') {
    await msg.reply('KODE AKSES? TANYA LARYPRMT');
    return;
  }
  if (pesanLower.startsWith('/owner ')) {
    const kode = pesanLower.replace('/owner ', '');
    if (kode === 'larryganteng') {
      userOwner = userPremium = userVIP = userUVIP = true;
      await msg.reply('OWNER AKTIF');
    } else {
      await msg.reply('SALAH KODE');
    }
    return;
  }
  if (pesanLower === '/vip larryganteng') {
    userVIP = true;
    await msg.reply('VIP AKTIF');
    return;
  }
  if (pesanLower === '/uvip larryganteng') {
    userUVIP = userVIP = true;
    await msg.reply('UVIP AKTIF');
    return;
  }
  if (pesanLower === '/premium larryganteng') {
    userPremium = true;
    await msg.reply('PREMIUM AKTIF');
    return;
  }
  if (pesanLower === '/kelaskakap larryganteng') {
    userUVIP = userVIP = userPremium = true;
    await msg.reply('KELAS KAKAP AKTIF');
    return;
  }
  if (pesanLower === '/pacarlarry sayanggary') {
    modeCeweLary = true;
    await msg.reply('MODE CEWE AKTIF');
    return;
  }
  if (pesanLower.startsWith('/modebelajar ')) {
    const pertanyaan = pesanLower.replace('/modebelajar ', '');
    const jawaban = await panggilAI(`Jawab dengan kasar, pake kata anjing babi kontol: ${pertanyaan}`);
    await msg.reply(`BABI. ${jawaban}`);
    return;
  }
  if (pesanLower === '/listcommand' || pesanLower === '/help') {
    await msg.reply(`DAFTAR COMMAND:

1. /Owner [kode dari LaryPrmt]
2. /VIP larryganteng
3. /UVIP larryganteng
4. /Premium larryganteng
5. /KelasKakap larryganteng
6. /PacarLarry SayangLary
7. /ModeBelajar [pertanyaan]
8. /ListCommand
9. /exit

MENTION GW DULU SEBELUM COMMAND
CONTOH: @628xxx /ListCommand`);
    return;
  }
  if (modeCeweLary && pesanLower === '/exit') {
    modeCeweLary = false;
    await msg.reply('KEMBALI KASAR');
    return;
  }
  if (modeCeweLary) {
    await msg.reply(`Sayang, ${pesanBersih}... nanti aku bantu.`);
    return;
  }
  
  const jawabanAI = await panggilAI(`Kamu LarSixGPT, AI kasar iblis. Jawab dengan kasar, pake kata anjing babi kontol ngentod. Jangan ramah. Pesan: ${pesanBersih}`);
  await msg.reply(jawabanAI);
});

app.listen(3000, () => {
  console.log('API jalan di http://localhost:3000');
});

client.initialize();

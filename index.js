const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const GEMINI_API_KEY = 'AIzaSyDHFf68P9c0yXoSW59HAL9kwMMtTmD9lX0';

let modeCeweLary = false;

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
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', qr => {
  console.log('SCAN QR INI:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('LARSIXGPT HIDUP');
  const info = await client.info;
  console.log(`NOMOR GW: ${info.wid._serialized.replace('@c.us', '')}`);
});

client.on('message', async msg => {
  if (msg.fromMe) return;
  
  const pesan = msg.body;
  const nomorGw = (await client.info).wid._serialized;
  const mentionGw = msg.mentionedIds && msg.mentionedIds.includes(nomorGw);
  
  if (!mentionGw) return;
  
  const pesanBersih = pesan.replace(new RegExp(`@${nomorGw.replace('@c.us', '')}`, 'g'), '').trim();
  const pesanLower = pesanBersih.toLowerCase();
  
  if (pesanLower === '/listcommand') {
    await msg.reply('COMMAND: /owner, /vip, /premium, /kelaskakap, /pacarlarry, /modebelajar, /exit');
    return;
  }
  
  const jawabanAI = await panggilAI(`Jawab dengan kasar: ${pesanBersih}`);
  await msg.reply(jawabanAI);
});

app.listen(3000, () => console.log('API:3000'));
client.initialize();

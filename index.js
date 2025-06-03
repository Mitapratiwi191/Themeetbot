const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close') {
      console.log('Connection closed, reconnecting...');
      startBot();
    } else if(connection === 'open') {
      console.log('Bot connected to WhatsApp!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg || !msg.message) return;

    const sender = msg.key.remoteJid;
    const isFromMe = msg.key.fromMe;
    if (isFromMe) return;

    const getContent = (msg) => {
      const m = msg.message;
      if (!m) return '';
      if (m.conversation) return m.conversation;
      if (m.extendedTextMessage) return m.extendedTextMessage.text;
      if (m.imageMessage?.caption) return m.imageMessage.caption;
      if (m.videoMessage?.caption) return m.videoMessage.caption;
      return '';
    };

    const text = getContent(msg).toLowerCase();

    console.log(`📩 Dari: ${sender}`);
    console.log(`💬 Pesan: ${text}`);

    try {
      if (text.includes('halo')) {
        await sock.sendMessage(sender, { text: 'Halo sayang 🖤 gimana kabarnya hari ini?' }, { quoted: msg });
      } else if (text.includes('pagi')) {
        await sock.sendMessage(sender, { text: 'Selamat pagi sayang 🌤️ semoga harimu indah!' }, { quoted: msg });
      } else if (text.includes('siang')) {
        await sock.sendMessage(sender, { text: 'Selamat siang 🌞 jangan lupa makan ya!' }, { quoted: msg });
      } else if (text.includes('sore')) {
        await sock.sendMessage(sender, { text: 'Selamat sore 🌇 semangat terus ya!' }, { quoted: msg });
      } else if (text.includes('malam')) {
        await sock.sendMessage(sender, { text: 'Selamat malam 🌙 mimpi indah ya sayang.' }, { quoted: msg });
      } else if (text.includes('assalamualaikum') || text.includes('salam')) {
        await sock.sendMessage(sender, { text: 'Waalaikumsalam, semoga damai dan bahagia selalu menyertaimu 🤍' }, { quoted: msg });
      } else if (text.includes('capek')) {
        await sock.sendMessage(sender, { text: 'Istirahat dulu ya sayang... jangan dipaksa, kamu juga butuh tenang 🫂' }, { quoted: msg });
      } else if (text.includes('sedih')) {
        await sock.sendMessage(sender, { text: 'Aku di sini kok... walau cuma bot, tapi siap nemenin kamu 😔💙' }, { quoted: msg });
      } else if (text.includes('bot')) {
        // Kalau kata "bot" juga dibalas random sederhana
        const botReplies = [
          'Ya, saya bot siap bantu kamu!',
          'Halo, ada yang bisa saya bantu?',
          'Siap melayani!'
        ];
        const res = botReplies[Math.floor(Math.random() * botReplies.length)];
        await sock.sendMessage(sender, { text: res }, { quoted: msg });
      }
    } catch (err) {
      console.error('⚠️ Gagal kirim pesan:', err);
    }
  });

  // Agar bot tetap hidup
  await new Promise(() => {});
}

startBot();

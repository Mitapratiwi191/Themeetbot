const makeWASocket = require('@whiskeysockets/baileys').default;
const { useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

const startBot = async () => {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '22.04.4']
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📲 Silakan scan QR berikut:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung ke WhatsApp!');
    }

    if (connection === 'close') {
      console.log('❌ Koneksi terputus. Mencoba ulang...');
      startBot();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text;

    console.log(`📥 Pesan dari ${from}: ${body}`);

    if (body === 'ping') {
      await sock.sendMessage(from, { text: 'pong!' });
    }
  });
};

startBot();



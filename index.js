sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    console.log('\n📲 Scan QR berikut ini untuk login:\n');
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




const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')

// File untuk menyimpan sesi login
const { state, saveState } = useSingleFileAuthState('./auth_info.json')

async function startSock() {
  const sock = makeWASocket({
    auth: state,
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      // Kalau sesi belum ada atau perlu scan ulang, tampilkan QR di terminal
      qrcode.generate(qr, { small: true })
      console.log('Silakan scan QR ini dengan WhatsApp kamu')
    }

    if (connection === 'open') {
      console.log('✅ Berhasil terhubung ke WhatsApp')
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      if (statusCode === DisconnectReason.loggedOut) {
        console.log('❌ Session telah logout, hapus file auth_info.json dan scan QR ulang')
      } else {
        console.log('⚠️ Koneksi terputus, mencoba reconnect...')
        startSock()
      }
    }
  })

  // Simpan sesi setiap ada perubahan
  sock.ev.on('creds.update', saveState)

  return sock
}

startSock()

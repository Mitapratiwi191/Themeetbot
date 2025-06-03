const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const { state, saveState } = useSingleFileAuthState('./auth_info.json')

async function startSock() {
  const sock = makeWASocket({
    auth: state,
    // jangan pakai printQRInTerminal: true, sudah deprecated
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      // Generate QR code di terminal
      qrcode.generate(qr, { small: true })
      console.log('Scan QR code ini dengan WhatsApp kamu')
    }

    if (connection === 'open') {
      console.log('Berhasil login ke WhatsApp!')
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut)
      console.log('Koneksi terputus, reconnect?', shouldReconnect)
      if (shouldReconnect) {
        startSock()
      } else {
        console.log('Sudah logout, hapus file auth_info.json dan scan ulang')
      }
    }
  })

  sock.ev.on('creds.update', saveState)

  // kamu bisa tambahkan event lain di sini sesuai kebutuhan

  return sock
}

startSock()

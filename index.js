const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const { Boom } = require('@hapi/boom')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update
        if (qr) {
            console.log('\n🔒 Scan QR ini:')
            qrcode.generate(qr, { small: true })  // Tampilkan QR code di terminal
        }
        if (connection === 'close') {
            const shouldReconnect = new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('❌ Koneksi terputus. Reconnect:', shouldReconnect)
            if (shouldReconnect) {
                startBot()
            }
        } else if (connection === 'open') {
            console.log('✅ Bot berhasil terhubung ke WhatsApp!')
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot()




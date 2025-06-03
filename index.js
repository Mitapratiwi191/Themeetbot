const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const { Boom } = require('@hapi/boom')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    })

    // ✅ Menampilkan QR code secara manual
    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update

        if (qr) {
            console.log('\n🔒 Scan QR ini dengan WhatsApp:')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('❌ Koneksi terputus. Reconnect:', shouldReconnect)
            if (shouldReconnect) {
                startBot()
            }
        } else if (connection === 'open') {
            console.log('✅ Bot berhasil terhubung ke WhatsApp!')
        }
    })

    sock.ev.on('creds.update', saveCreds)

    // ✅ Balasan otomatis
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text
        const sender = msg.key.remoteJid

        const keywords = {
            halo: 'Hai juga!',
            pagi: 'Selamat pagi ☀️',
            siang: 'Selamat siang 🌤️',
            sore: 'Selamat sore 🌇',
            malam: 'Selamat malam 🌙',
            capek: 'Semangat ya! 💪',
            sedih: 'Jangan sedih, aku ada kok 🥺',
            salam: 'Waalaikumussalam',
            bot: 'Aku di sini! 🤖'
        }

        const reply = keywords[text?.toLowerCase()]
        if (reply) {
            await sock.sendMessage(sender, { text: reply }, { quoted: msg })
        }
    })
}

startBot()



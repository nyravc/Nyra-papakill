const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const P = require('pino');
const path = require('path');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        const isAdmin = true; // Aqui você pode implementar verificação real

        switch (body?.toLowerCase()) {
            case '.menu':
                const menuText = `
╭───❖「 *Nyra Papakill* 」❖───
│
│  Prefixo: .
│
│  COMANDOS:
│  • .fig – Criar figurinha
│  • .play nome – Baixar música
│  • .video nome – Baixar vídeo
│  • .tapa – Enviar tapa
│  • .puxar @ – Buscar dados
│  • .ban @ – Banir do grupo (só ADM)
│
╰─────────────❖
`
                const imgBuffer = fs.readFileSync('./menu.jpg');
                await sock.sendMessage(sender, { image: imgBuffer, caption: menuText }, { quoted: msg });
                break;

            case '.tapa':
                await sock.sendMessage(sender, { text: 'PÁÁÁÁÁÁÁÁÁÁ!' }, { quoted: msg });
                break;

            case '.fig':
                await sock.sendMessage(sender, { text: 'Função de figurinha em desenvolvimento.' }, { quoted: msg });
                break;

            case '.ban':
                if (!isGroup) return sock.sendMessage(sender, { text: 'Só funciona em grupos.' });
                if (!isAdmin) return sock.sendMessage(sender, { text: 'Apenas ADM pode usar esse comando.' });
                sock.sendMessage(sender, { text: 'Usuário banido! (brincadeira)' }, { quoted: msg });
                break;
        }
    });
}

startBot();
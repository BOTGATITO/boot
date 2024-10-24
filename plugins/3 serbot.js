
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, MessageRetryMap, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys')
import moment from 'moment-timezone'
import PhoneNumber from 'awesome-phonenumber'
import NodeCache from 'node-cache'
import readline from 'readline'
import qrcode from "qrcode"
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import fs from "fs"
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import pino from 'pino'
import * as ws from 'ws'
const { CONNECTING } = ws
import { Boom } from '@hapi/boom'
import { makeWASocket } from '../lib/simple.js'

if (global.conns instanceof Array) console.log()
else global.conns = []

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJsonPath = join(__dirname, '../package.json')
const { name, author, version: versionSB, description } = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

let folderBot = 'GataBotSession', nameBotMD = 'GataBot-MD', opcion = ''
let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner, text }) => {
if (!global.db.data.settings[conn.user.jid].jadibotmd) return _conn.sendMessage(m.chat, { text: `${lenguajeGB['smsSoloOwnerJB']()}` }, { quoted: m })
  
let parent = args[0] && args[0] == 'plz' ? _conn : await global.conn
text = (text ? text : (args[0] ? args[0] : '')).toLowerCase()

/*
let message1 = `Procesando ...`
if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == _conn.user.jid)) {
if (text.includes('qr')) {
return parent.sendMessage(m.chat, { text: message1 + '%20qr' }, { quoted: m })
} else if (text.includes('code')) {
return parent.sendMessage(m.chat, { text: message1 + '%20code' }, { quoted: m })
} else {
return parent.sendMessage(m.chat, { text: message1 + '%20code' }, { quoted: m })
}}
*/
let authFolderB = crypto.randomBytes(10).toString('hex').slice(0, 8)
async function serbot() {
if (!fs.existsSync(`./${folderBot}/` + authFolderB)){
fs.mkdirSync(`./${folderBot}/` + authFolderB, { recursive: true })
}
args[0] ? fs.writeFileSync(`./${folderBot}/` + authFolderB + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  
const { state, saveState, saveCreds } = await useMultiFileAuthState(`./${folderBot}/${authFolderB}`)
const msgRetryCounterMap = (MessageRetryMap) => { }
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion()
let phoneNumber = m.sender.split('@')[0]

const methodCodeQR = text.includes('qr') || false
const methodCode = text.includes('code') || true
const MethodMobile = process.argv.includes("mobile")

if (text.includes('qr')) {
opcion = '1'
} else if (text.includes('code')) {
opcion = '2'
} else {
opcion = '2'
}

const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
mobile: MethodMobile, 
browser: opcion == '1' ? [`ProyectoX`, 'Edge', '2.0.0'] : ['Ubuntu', 'Edge', '110.0.1587.56'], 
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })), },
markOnlineOnConnect: true, 
generateHighQualityLinkPreview: true, 
getMessage: async (clave) => {
let jid = jidNormalizedUser(clave.remoteJid)
let msg = await store.loadMessage(jid, clave.id)
return msg?.message || ""
},
msgRetryCounterCache,
msgRetryCounterMap,
defaultQueryTimeoutMs: undefined,   
version
}
  let conn = makeWASocket(connectionOptions)
conn.isInit = false
let isInit = true

let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '')
  
let txt = ''
if (!fs.existsSync(`./${folderBot}/` + authFolderB + "/creds.json")){
if (opcion == '1') {
txt = `
✦ *Versión de ${name} »* *\`${versionSB}\`*
✦ *Versión de JadiBot »* *\`${global.vsJB}\`*
✦ *Descripción »* _${description}_\n
*No sólo el diseño del mensaje se ha renovado. ✨ ¡Disfruta de ${name}!*`
} else {  
txt = `¡𝗛𝗼𝗹𝗮 𝗵𝘂𝗺𝗮𝗻𝗼! 👋🏻 

Se te enviará un código de 8 dígitos, introduzca en vincular dispositivos. 

> Este código será solo valido para *@${phoneNumber}*

 Tiempo : 1 minuto`

let codeA, codeB 
setTimeout(async () => {
let codeBot = await conn.requestPairingCode(cleanedNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
codeA = await parent.sendMessage(m.chat, { text: txt.trim(), mentions: [m.sender] }, { quoted: m })  
codeB = await parent.sendMessage(m.chat, { text: codeBot }, { quoted: m })
}, 2000)

setTimeout(() => {
parent.sendMessage(m.chat, { delete: codeA.key })
parent.sendMessage(m.chat, { delete: codeB.key })
}, 60000) // 1 min
}
}
async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) conn.isInit = true
if (opcion == '1') {
let scan = await parent.sendFile(m.chat, await qrcode.toDataURL(qr, { scale: 8 }), 'qrcode.png', txt.trim(), m)
setTimeout(() => {
parent.sendMessage(m.chat, { delete: scan.key })
}, 50000) //50 segundos
}
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
let i = global.conns.indexOf(conn)
if (i < 0) { 
console.log(await creloadHandler(true).catch(console.error))
}
delete global.conns[i]
global.conns.splice(i, 1)
if (code !== DisconnectReason.connectionClosed) {
parent.sendMessage(m.chat, { text: "𝗖𝗼𝗻𝗲𝘅𝗶𝗼́𝗻 𝗲𝘅𝗶𝘁𝗼𝘀𝗮. ✅\n\n¡𝖦𝗋𝖺𝖼𝗂𝖺𝗌 𝗉𝗈𝗋 𝗎𝗍𝗂𝗅𝗂𝗓𝖺𝗋 𝗇𝗎𝖾𝗌𝗍𝗋𝗈𝗌 𝗌𝖾𝗋𝗏𝗂𝖼𝗂𝗈𝗌!\n𝙋𝙧𝙤𝙮𝙚𝙘𝙩𝙤𝙓 // 𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 𝙂𝙡𝙤𝙗𝙖𝙡" }, { quoted: m })
} else {
parent.sendMessage(m.chat, { text: "*La conexión se cerró*, Tendrá que conectarse manualmente usando el comando .codetoken" }, { quoted: m })
}}
    
if (global.db.data == null) loadDatabase()
if (connection == 'open') {
conn.isInit = true
global.conns.push(conn)
await parent.sendMessage(m.chat, {text : args[0] ? '✅ *¡Conectado con exito!*' : `✅ *Conectado con WhatsApp*\n\n♻️ *Comandos relacionados con Sub Bot:*\n» *#stop* _(Pausar ser bot)_\n» *#eliminarsesion* _(Dejar de ser bot y eliminar datos)_\n» *#serbot [texto largo]* _(Reanudar ser Bot en caso que este pausado o deje de funcionar)_\n\n*Gracias por usar ❤️${name} 🐈*\n\n📢 *Informate de las novedades en nuestro canal oficial:*\n${canal2}\n\n🤩 *Descubre más formas de seguir pendiente de este proyecto:*\n${cuentas}\n\n💝 *Puede hacer una Donación voluntaria por PayPal:*\n${paypal}` }, { quoted: m })
  
args[0] ? console.log(`*Usuario Sub Bot reconectandose: ${PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international')} (${conn.getName(conn.user.jid)})*`) : console.log(`*Nuevo usuario conectado como Sub Bot: ${PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international')} (${conn.getName(conn.user.jid)})*`)
await sleep(5000)
if (args[0]) return
await parent.sendMessage(conn.user.jid, {text : '*Si pausa ser sub bot o deja de funcionar, envíe este mensaje para intentar conectarse nuevamente*'}, { quoted: m })
await parent.sendMessage(conn.user.jid, {text : usedPrefix + command + " " + Buffer.from(fs.readFileSync(`./${folderBot}/` + authFolderB + "/creds.json"), "utf-8").toString("base64")}, { quoted: m })
}}
  setInterval(async () => {
if (!conn.user) {
try { conn.ws.close() } catch { }
conn.ev.removeAllListeners()
let i = global.conns.indexOf(conn)
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)
    
let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e)
}
if (restatConn) {
try { conn.ws.close() } catch { }
conn.ev.removeAllListeners()
conn = makeWASocket(connectionOptions)
isInit = true
}

if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}
  
conn.handler = handler.handler.bind(conn)
conn.connectionUpdate = connectionUpdate.bind(conn)
conn.credsUpdate = saveCreds.bind(conn, true)

conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
}
serbot()
  
}
handler.command = ['jadibot', 'serbot']
export default handler

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms))
}

function isBase64(text) {
const validChars = /^[A-Za-z0-9+/]*={0,2}$/
if (text.length % 4 === 0 && validChars.test(text)) {
const decoded = Buffer.from(text, 'base64').toString('base64')
return decoded === text
}
return false
}

function fileExists(filePath) {
try {
return fs.statSync(filePath).isFile()
} catch (err) {
return false
}}

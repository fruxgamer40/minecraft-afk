// Catch unhandled packet errors so they never print messy stack traces
process.on('uncaughtException', (err) => {
  if (err.message && (err.message.includes('PartialReadError') || err.message.includes('Read error'))) {
    console.log(`⚠️  [PROTOCOL] Packet sync mismatch.`);
  }
});

const mineflayer = require('mineflayer');
const config = require('./config.json');

// ==========================================
// CONFIGURABLE CLIENT VERSION OPTION
// Set explicitly to match your Paper 26.3 server protocol or use a compatible string
// ==========================================
const CLIENT_VERSION = "1.21.1"; 

let bot;
let usernameIndex = 0;

function getNextUsername() {
  if (!config.botUsernames || config.botUsernames.length === 0) {
    return 'DefaultBot';
  }
  const currentName = config.botUsernames[usernameIndex];
  usernameIndex = (usernameIndex + 1) % config.botUsernames.length;
  return currentName;
}

function createBot() {
  const currentUsername = getNextUsername();
  
  console.log('\n----------------------------------------');
  console.log(`🤖 [BOT] Connecting as: \x1b[36m${currentUsername}\x1b[0m`);
  console.log(`📦 [VERSION] Target: \x1b[33m${CLIENT_VERSION}\x1b[0m`);
  console.log('----------------------------------------');

  bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: currentUsername,
    auth: 'offline',
    version: CLIENT_VERSION,
    viewDistance: config.botChunk
  });

  bot.once('spawn', () => {
    console.log(`✨ [\x1b[32mONLINE\x1b[0m] ${currentUsername} successfully joined and is standing passively.`);
  });

  bot.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
      console.log(`⚠️  [\x1b[31mNETWORK\x1b[0m] Connection reset by server (ECONNRESET).`);
    } else if (err.code === 'ENOTFOUND') {
      console.log(`⚠️  [\x1b[31mNETWORK\x1b[0m] Host not found. Check serverHost.`);
    } else {
      console.log(`⚠️  [\x1b[31mERROR\x1b[0m] ${err.message || err}`);
    }
  });

  bot.on('end', () => {
    console.log(`🔌 [\x1b[33mDISCONNECTED\x1b[0m] Rotating account in 5 seconds...\n`);
    setTimeout(createBot, 5000);
  });
}

createBot();

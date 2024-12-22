
const telegramService = require('./services/telegramService');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Telegram Circle Wallet Bot is running...');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Telegram Circle Wallet Bot is running on port ${PORT}...`);
});

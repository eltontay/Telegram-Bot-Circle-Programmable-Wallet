
const telegramService = require('./services/telegramService');
const http = require('http');

process.env.NTBA_FIX_319 = 1;
let isShuttingDown = false;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Telegram Circle Wallet Bot is running...');
});

const PORT = process.env.PORT || 3000;

process.on('SIGTERM', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('Received SIGTERM. Gracefully shutting down...');
  telegramService.stop();
  server.close(() => {
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (!isShuttingDown) {
    isShuttingDown = true;
    telegramService.stop();
    server.close(() => {
      process.exit(1);
    });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Telegram Circle Wallet Bot is running on port ${PORT}...`);
});

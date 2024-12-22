
const TelegramBot = require("node-telegram-bot-api");
const config = require("../config");
const circleService = require("./circleService");
const storageService = require("./storageService");

class TelegramService {
  constructor() {
    this.bot = null;
    this.initializeBot();
  }

  initializeBot() {
    try {
      if (this.bot) {
        this.stop();
      }

      const options = {
        polling: false,
        webHook: false
      };

      this.bot = new TelegramBot(config.telegram.botToken, options);
      
      // Start polling after setup
      this.bot.startPolling({
        restart: true,
        onlyFirstMatch: true,
        interval: 2000,
        params: {
          timeout: 10
        }
      });

      this.setupCommands();
      this.setupErrorHandlers();
    } catch (error) {
      console.error('Bot initialization error:', error);
      process.exit(1);
    }
  }

  setupErrorHandlers() {
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error);
      if (error.code === 'EFATAL' || error.code === 'ETELEGRAM') {
        setTimeout(() => {
          console.log('Attempting to reinitialize bot...');
          this.initializeBot();
        }, 5000);
      }
    });

    this.bot.on('error', (error) => {
      console.error('Bot error:', error);
    });
  }

  stop() {
    if (this.bot) {
      try {
        this.bot.stopPolling();
        this.bot = null;
      } catch (error) {
        console.error('Error stopping bot:', error);
      }
    }
  }

  setupCommands() {
    if (!this.bot) return;
    
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.onText(/\/createWallet/, this.handleCreateWallet.bind(this));
    this.bot.onText(/\/balance/, this.handleBalance.bind(this));
    this.bot.onText(/\/send (.+)/, this.handleSend.bind(this));
    this.bot.onText(/\/address/, (msg) => this.handleAddress(msg));
    this.bot.onText(/\/walletId/, this.handleWalletId.bind(this));
  }

  // ... rest of your handler methods remain the same
}

module.exports = new TelegramService();

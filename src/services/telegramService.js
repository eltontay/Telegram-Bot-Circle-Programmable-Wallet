const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const circleService = require('./circleService');

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: true });
    this.walletStore = {}; // In-memory store for wallet information
    this.setupCommands();
  }

  setupCommands() {
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.onText(/\/createwallet/, this.handleCreateWallet.bind(this));
    this.bot.onText(/\/balance/, this.handleBalance.bind(this));
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const message =
      `Welcome to Circle Wallet Bot! 🚀\n\n` +
      `Available commands:\n` +
      `/createwallet - Create a new wallet\n` +
      `/balance - Check your wallet balance`;

    await this.bot.sendMessage(chatId, message);
  }

  async handleCreateWallet(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      await this.bot.sendMessage(chatId, 'Creating your wallet...');

      const { walletId, walletData } = await circleService.createWallet(userId);
      const address = walletData.data.wallets[0].address;

      // Store the wallet information in the in-memory store
      this.walletStore[userId] = { walletId, address };

      const message =
        `✅ Wallet created successfully!\n\n` +
        `Wallet Address: \`${address}\`\n` +
        `Network: ${config.network.name}`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        '❌ Error creating wallet. Please try again later.'
      );
    }
  }

  async handleBalance(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      // Retrieve the existing wallet information from the in-memory store
      const walletInfo = this.walletStore[userId];
      if (!walletInfo) {
        throw new Error('No wallet found for the user. Please create a wallet first.');
      }

      console.log("wallet info wallet id" , walletInfo.walletId);
      const balance = await circleService.getWalletBalance(walletInfo.walletId);

      const message =
        `💰 Wallet Balance:\n\n` +
        `ETH: ${balance.eth}\n` +
        `USDC: ${balance.usdc}`;

      await this.bot.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error fetching balance:', error); // Log the error for debugging
      await this.bot.sendMessage(
        chatId,
        '❌ Error fetching balance. Please try again later.'
      );
    }
  }
}

module.exports = new TelegramService();

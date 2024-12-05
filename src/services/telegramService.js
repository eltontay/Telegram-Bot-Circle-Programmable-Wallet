const TelegramBot = require("node-telegram-bot-api");
const config = require("../config");
const circleService = require("./circleService");
const storageService = require("./storageService");

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: true });
    this.setupCommands();
  }

  setupCommands() {
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.onText(/\/createWallet/, this.handleCreateWallet.bind(this));
    this.bot.onText(/\/balance/, this.handleBalance.bind(this));
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const message =
      `👋 Welcome to Circle Wallet Bot!\n\n` +
      `Available commands:\n` +
      `/createWallet - Create a new SCA wallet\n` +
      `/balance - Check your wallet's ETH and USDC balance`;
    await this.bot.sendMessage(chatId, message);
  }

  async handleCreateWallet(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      // Check if wallet already exists
      const existingWallet = storageService.getWallet(userId);
      if (existingWallet) {
        return await this.bot.sendMessage(
          chatId,
          `You already have a wallet!\nAddress: \`${existingWallet.address}\``,
          { parse_mode: "Markdown" },
        );
      }

      await this.bot.sendMessage(chatId, "Creating your wallet...");

      const { walletId, walletData } = await circleService.createWallet(userId);
      const address = walletData.data.wallets[0].address;

      // Store the wallet information persistently
      storageService.saveWallet(userId, { walletId, address });

      const message =
        `✅ Wallet created successfully!\n\n` +
        `Wallet Address: \`${address}\`\n` +
        `Network: ${config.network.name}`;

      await this.bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        "❌ Error creating wallet. Please try again later.",
      );
    }
  }

  async handleBalance(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      const walletInfo = storageService.getWallet(userId);
      if (!walletInfo) {
        throw new Error(
          "No wallet found for the user. Please create a wallet first.",
        );
      }

      const balance = await circleService.getWalletBalance(walletInfo.walletId);

      const message =
        `💰 Wallet Balance:\n\n` +
        `ETH: ${balance.eth}\n` +
        `USDC: ${balance.usdc}`;

      await this.bot.sendMessage(chatId, message);
    } catch (error) {
      console.error("Error fetching balance:", error);
      await this.bot.sendMessage(
        chatId,
        "❌ Error fetching balance. Please try again later.",
      );
    }
  }
}

module.exports = new TelegramService();

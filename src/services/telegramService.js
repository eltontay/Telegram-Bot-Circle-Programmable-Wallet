
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
    this.bot.onText(/\/send (.+)/, this.handleSend.bind(this));
    this.bot.onText(/\/address/, this.handleAddress.bind(this));
    this.bot.onText(/\/walletId/, this.handleWalletId.bind(this));
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const message = `Welcome to Circle Wallet Bot!\n\nCommands:\n/createWallet - Create a wallet\n/address - Get wallet address\n/balance - Check USDC balance\n/send <address> <amount> - Send USDC`;
    await this.bot.sendMessage(chatId, message);
  }

  async handleCreateWallet(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const wallet = storageService.getWallet(userId);
      if (wallet) {
        await this.bot.sendMessage(chatId, "You already have a wallet!");
        return;
      }

      const { walletId, walletData } = await circleService.createWallet(userId);
      const address = walletData.data.wallets[0].address;
      storageService.saveWallet(userId, { walletId, address });
      await this.bot.sendMessage(chatId, `Wallet created!\nAddress: ${address}`);
    } catch (error) {
      await this.bot.sendMessage(chatId, "Error creating wallet. Try again later.");
    }
  }

  async handleBalance(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    try {
      const wallet = storageService.getWallet(userId);
      if (!wallet) {
        await this.bot.sendMessage(chatId, "Create a wallet first with /createWallet");
        return;
      }

      const balance = await circleService.getWalletBalance(wallet.walletId);
      await this.bot.sendMessage(chatId, `USDC Balance: ${balance.usdc} USDC`);
    } catch (error) {
      await this.bot.sendMessage(chatId, "Error getting balance. Try again later.");
    }
  }

  async handleAddress(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const wallet = storageService.getWallet(userId);
    if (!wallet) {
      await this.bot.sendMessage(chatId, "Create a wallet first with /createWallet");
      return;
    }

    await this.bot.sendMessage(chatId, `Wallet address: ${wallet.address}`);
  }

  async handleWalletId(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const wallet = storageService.getWallet(userId);
    if (!wallet) {
      await this.bot.sendMessage(chatId, "Create a wallet first with /createWallet");
      return;
    }

    await this.bot.sendMessage(chatId, `Wallet ID: ${wallet.walletId}`);
  }

  async handleSend(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    try {
      const wallet = storageService.getWallet(userId);
      if (!wallet) {
        await this.bot.sendMessage(chatId, "Create a wallet first with /createWallet");
        return;
      }

      const [_, destinationAddress, amount] = match[1].split(' ');
      if (!destinationAddress || !amount) {
        await this.bot.sendMessage(chatId, "Format: /send <address> <amount>");
        return;
      }

      const transaction = await circleService.sendTransaction(wallet.walletId, destinationAddress, amount);
      await this.bot.sendMessage(chatId, `Transaction sent!\nID: ${transaction.transaction.id}`);
    } catch (error) {
      await this.bot.sendMessage(chatId, "Error sending transaction. Try again later.");
    }
  }
}

module.exports = new TelegramService();

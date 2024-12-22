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
    const message = `Welcome to Circle Wallet Bot!\n\nCommands:\n/createWallet - Create a wallet\n/address - Get wallet address\n/walletId - Get wallet ID\n/balance - Check USDC balance\n/send <address> <amount> - Send USDC`;
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
      await this.bot.sendMessage(
        chatId,
        `Wallet created!\nAddress: ${address}`,
      );
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        "Error creating wallet. Try again later.",
      );
    }
  }

  async handleBalance(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const wallet = storageService.getWallet(userId);
      if (!wallet) {
        await this.bot.sendMessage(
          chatId,
          "Create a wallet first with /createWallet",
        );
        return;
      }

      const balance = await circleService.getWalletBalance(wallet.walletId);
      await this.bot.sendMessage(chatId, `USDC Balance: ${balance.usdc} USDC`);
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        "Error getting balance. Try again later.",
      );
    }
  }

  async handleAddress(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const wallet = storageService.getWallet(userId);
    if (!wallet) {
      await this.bot.sendMessage(
        chatId,
        "Create a wallet first with /createWallet",
      );
      return;
    }

    await this.bot.sendMessage(chatId, `Wallet address: ${wallet.address}`);
  }

  async handleWalletId(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const wallet = storageService.getWallet(userId);
    if (!wallet) {
      await this.bot.sendMessage(
        chatId,
        "Create a wallet first with /createWallet",
      );
      return;
    }

    await this.bot.sendMessage(chatId, `Wallet ID: ${wallet.walletId}`);
  }

  async handleSend(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    try {
      const walletInfo = storageService.getWallet(userId);
      if (!walletInfo) {
        throw new Error("No wallet found. Please create a wallet first.");
      }
      const params = match[1].split(" ");
      if (params.length !== 2) {
        throw new Error("Invalid format. Use: /send <address> <amount>");
      }
      const [destinationAddress, amount] = params;
      await this.bot.sendMessage(chatId, "Processing transaction...");
      const txResponse = await circleService.sendTransaction(
        walletInfo.walletId,
        destinationAddress,
        amount,
      );
      const message =
        `✅ Transaction submitted!\n\n` +
        `Amount: ${amount} USDC\n` +
        `To: ${destinationAddress}\n` +
        `Transaction ID: ${txResponse.id}`;

      await this.bot.sendMessage(chatId, message);
    } catch (error) {
      console.error("Error sending transaction:", error);
      await this.bot.sendMessage(
        chatId,
        `❌ Error: ${error.message || "Failed to send transaction. Please try again later."}`,
      );
    }
  }
}

module.exports = new TelegramService();

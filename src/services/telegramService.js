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
    this.bot.onText(/\/address/, (msg) => this.handleAddress(msg));
    this.bot.onText(/\/walletId/, this.handleWalletId.bind(this));
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const message =
      `👋 Welcome to Circle Wallet Bot!\n\n` +
      `Available commands:\n` +
      `/createWallet - Create a new SCA wallet\n` +
      `/balance - Check your wallet's USDC balance\n` +
      `/address - Get your wallet address\n` +
      `/walletId - Get your wallet ID\n` +
      `/send <address> <amount> - Send USDC to another address\n\n` +
      `Example of send command:\n` +
      `/send 0x742d35Cc6634C0532925a3b844Bc454e4438f44e 10`;
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

  async handleAddress(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    try {
      const walletInfo = storageService.getWallet(userId);
      if (!walletInfo) {
        throw new Error(
          "No wallet found. Please create a wallet first using /create",
        );
      }
      const message =
        `🔑 Your Wallet Address:\n\n` +
        `\`${walletInfo.address}\`\n\n` +
        `Network: ${config.network.name}`;
      await this.bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error fetching address:", error);
      await this.bot.sendMessage(
        chatId,
        `❌ Error: ${error.message || "Failed to fetch address. Please try again later."}`,
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

      const message = `💰 Wallet Balance:\n\n` + `USDC: ${balance.usdc}`;

      await this.bot.sendMessage(chatId, message);
    } catch (error) {
      console.error("Error fetching balance:", error);
      await this.bot.sendMessage(
        chatId,
        "❌ Error fetching balance. Please try again later.",
      );
    }
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
        `Transaction ID: ${txResponse.id}`; // SDK returns id in the response

      await this.bot.sendMessage(chatId, message);
    } catch (error) {

  async handleWalletId(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    try {
      const walletInfo = storageService.getWallet(userId);
      if (!walletInfo) {
        throw new Error("No wallet found. Please create a wallet first using /createWallet");
      }
      const message = `🔑 Your Wallet ID:\n\n\`${walletInfo.walletId}\`\n\nNetwork: ${config.network.name}`;
      await this.bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error fetching wallet ID:", error);
      await this.bot.sendMessage(chatId, `❌ Error: ${error.message || "Failed to fetch wallet ID. Please try again later."}`);
    }
  }


      console.error("Error sending transaction:", error);
      await this.bot.sendMessage(
        chatId,
        `❌ Error: ${error.message || "Failed to send transaction. Please try again later."}`,
      );
    }
  }
}

module.exports = new TelegramService();

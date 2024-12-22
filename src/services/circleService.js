const {
  initiateDeveloperControlledWalletsClient,
} = require("@circle-fin/developer-controlled-wallets");
const {
  SmartContractPlatformSDK,
} = require("@circle-fin/smart-contract-platform");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const axios = require("axios");

class CircleService {
  constructor() {
    this.walletSDK = new initiateDeveloperControlledWalletsClient({
      apiKey: config.circle.apiKey,
      entitySecret: config.circle.entitySecret,
    });
  }

  async createWallet(userId) {
    try {
      const walletSetResponse = await this.walletSDK.createWalletSet({
        name: "WalletSet 1",
      });

      const walletData = await this.walletSDK.createWallets({
        idempotencyKey: uuidv4(),
        blockchains: [config.network.name],
        accountType: "SCA",
        walletSetId: walletSetResponse.data?.walletSet?.id ?? "",
      });
      const walletId = walletData.data.wallets[0].id;
      return { walletId, walletData };
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  }

  async getWalletBalance(walletId) {
    try {
      const response = await axios.get(
        `https://api.circle.com/v1/w3s/wallets/${walletId}/balances`,
        {
          headers: {
            Authorization: `Bearer ${config.circle.apiKey}`,
          },
        },
      );

      const balances = response.data.data.tokenBalances;

      // Filter and format balances
      const usdcBalance =
        balances.find((b) => b.token.id === config.network.usdcTokenId)
          ?.amount || "0";

      return {
        usdc: usdcBalance,
      };
    } catch (error) {
      console.error("Error getting wallet balance:", error); // Log the error for debugging
      throw error;
    }
  }

  async sendTransaction(walletId, destinationAddress, amount) {
    try {
      const response = await this.walletSDK.createTransaction({
        walletId: walletId,
        tokenId: config.network.usdcTokenId,
        destinationAddress: destinationAddress,
        amounts: [amount],
        fee: {
          type: "level",
          config: {
            feeLevel: "LOW",
          },
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }

  async getWalletId(address) {
    try {
      const response = await axios.get(
        `https://api.circle.com/v1/w3s/wallets?address=${address}`,
        {
          headers: {
            Authorization: `Bearer ${config.circle.apiKey}`,
          },
        }
      );
      return response.data.data.wallets[0]?.id;
    } catch (error) {
      console.error("Error retrieving wallet ID:", error);
      throw error;
    }
  }
}

module.exports = new CircleService();

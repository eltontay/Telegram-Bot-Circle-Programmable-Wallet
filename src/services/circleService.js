const {
  initiateDeveloperControlledWalletsClient,
} = require('@circle-fin/developer-controlled-wallets');
const {
  SmartContractPlatformSDK,
} = require('@circle-fin/smart-contract-platform');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

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
        name: 'WalletSet 1',
      });

      const walletData = await this.walletSDK.createWallets({
        idempotencyKey: uuidv4(),
        blockchains: [config.network.name],
        accountType: 'SCA',
        walletSetId: walletSetResponse.data?.walletSet?.id ?? '',
      });
      return walletData;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  async getWalletBalance(walletId) {
    try {
      const balances = await this.platformSDK.getBalances({
        walletId,
        blockchain: config.network.name,
      });

      // Filter and format balances
      const ethBalance =
        balances.data.find((b) => b.tokenId === null)?.amount || '0';
      const usdcBalance =
        balances.data.find((b) => b.tokenId === config.network.usdcTokenId)
          ?.amount || '0';

      return {
        eth: ethBalance,
        usdc: usdcBalance,
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  async getWalletAddress(walletId) {
    try {
      const wallet = await this.walletSDK.getWallet({
        walletId,
      });

      const address = wallet.data.addresses.find(
        (addr) => addr.blockchain === config.network.name
      )?.address;

      if (!address) {
        throw new Error('No address found for the specified blockchain');
      }

      return address;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      throw error;
    }
  }
}

module.exports = new CircleService();

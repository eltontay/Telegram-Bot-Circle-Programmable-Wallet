const fs = require("fs");
const path = require("path");

class StorageService {
  constructor() {
    this.storageFile = path.join(__dirname, "../../data/wallets.json");
    this.ensureStorageExists();
  }

  ensureStorageExists() {
    const dir = path.dirname(this.storageFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.storageFile)) {
      fs.writeFileSync(this.storageFile, JSON.stringify({}));
    }
  }

  saveWallet(userId, walletData) {
    const data = this.getAllWallets();
    data[userId] = walletData;
    fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2));
  }

  getWallet(userId) {
    const data = this.getAllWallets();
    return data[userId];
  }

  getAllWallets() {
    try {
      return JSON.parse(fs.readFileSync(this.storageFile, "utf8"));
    } catch (error) {
      return {};
    }
  }
}

module.exports = new StorageService();

require('dotenv').config();

module.exports = {
  circle: {
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
  network: {
    name: process.env.NETWORK || 'ARB-SEPOLIA',
    usdcAddress: process.env.USDC_TOKEN_ADDRESS || '0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d',
    usdcTokenId: process.env.USDC_TOKEN_ID || '4b8daacc-5f47-5909-a3ba-30d171ebad98',
  },
};
# Telegram Circle Wallet Bot

A Telegram bot that creates and manages developer-controlled wallets using Circle's SDK. This bot allows users to create SCA (Smart Contract Account) wallets on the ARB-SEPOLIA network and check their ETH and USDC balances.

## Features

- Create SCA wallets on ARB-SEPOLIA network
- View wallet address
- Check ETH (native token) balance
- Check USDC balance
- Secure storage of sensitive credentials

## Prerequisites

- Node.js v16 or higher
- Circle API Key and Entity Secret
- Telegram Bot Token (obtain from [@BotFather](https://t.me/BotFather))

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/eltontay/telegram-bot-circle-programmable-wallet.git
   cd telegram-bot-circle-programmable-wallet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```bash
   cp .env.sample .env
   ```

4. Configure your environment variables in the .env file:
   - Add your Circle API Key
   - Add your Circle Entity Secret
   - Add your Telegram Bot Token

## Configuration

The bot is configured to use:
- Network: ARB-SEPOLIA
- USDC Token Address: 0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d
- USDC Token ID: 4b8daacc-5f47-5909-a3ba-30d171ebad98

You can modify these values in the .env file if needed.

## Running the Bot

1. Start the bot:
   ```bash
   npm start
   ```

2. For development with auto-reload:
   ```bash
   npm run dev
   ```

## Usage

1. Start a chat with your bot on Telegram
2. Available commands:
   - `/start` - Display welcome message and available commands
   - `/createWallet` - Create a new SCA wallet
   - `/balance` - Check your wallet's ETH and USDC balance

## Security Considerations

- Never commit your .env file
- Keep your Circle API Key and Entity Secret secure
- Regularly rotate your credentials
- Monitor wallet activities for suspicious transactions

## Error Handling

The bot includes basic error handling for:
- Wallet creation failures
- Balance check errors
- Network connectivity issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
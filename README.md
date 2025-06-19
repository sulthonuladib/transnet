# TransNet

A unified CEX (Centralized Exchange) crypto withdrawal system built with modern web technologies. TransNet provides a single interface to manage crypto withdrawals across multiple exchanges with real-time network status checking and saved wallet management.

## ✨ Features

- **Multi-Exchange Support**: Unified interface for MEXC, Binance, and other CEX platforms
- **Real-time Data**: Live balance checking and network status validation
- **Saved Wallets**: Store and manage frequently used wallet addresses
- **Transaction History**: Track all withdrawal transactions with detailed status
- **Security First**: Secure API key storage with connection testing
- **Modern UI**: Built with HTMX, Tailwind CSS, and DaisyUI for smooth interactions

## 🚀 Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Ultra-fast JavaScript runtime and toolkit
- **Framework**: [Hono](https://hono.dev/) - Ultrafast web framework built on Web Standards  
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/) - TypeScript-first ORM
- **Frontend**: [HTMX](https://htmx.org/) + [Hyperscript](https://hyperscript.org/) - Modern hypermedia architecture
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [DaisyUI 5](https://daisyui.com/) - Utility-first CSS with components
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation

## 📋 Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or higher
- SQLite (included with Bun)
- API keys from supported exchanges (MEXC, Binance)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transnet
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   bun run db:migrate
   ```

5. **Build assets**
   ```bash
   bun run build:assets
   ```

## 🚀 Quick Start

1. **Start development server**
   ```bash
   bun run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

3. **Configure exchanges**
   - Go to Exchange Settings
   - Add your API keys for supported exchanges
   - Test connections before saving

4. **Start withdrawing**
   - Add wallet addresses to your saved wallets
   - Use the withdraw form to send crypto across networks

## 📝 Available Scripts

### Development
```bash
bun run dev          # Start development server with hot reload
bun run build:assets # Build CSS and client-side assets
```

### Database
```bash
bun run db:generate  # Generate migration from schema changes
bun run db:migrate   # Run pending migrations
bun run db:studio    # Open Drizzle Studio for database management
bun run db:push      # Push schema changes directly to database
```

### Production
```bash
bun run build       # Build for production
bun run start       # Start production server
```

## 🏗️ Project Structure

```
├── src/
│   ├── server/
│   │   └── index.tsx          # Main Hono server with routes
│   ├── components/            # React TSX components
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── WithdrawForm.tsx   # Withdrawal interface
│   │   ├── WalletManager.tsx  # Saved wallet management
│   │   └── ...
│   ├── database/
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   └── migrations/        # Database migrations
│   ├── exchanges/
│   │   ├── interfaces/base.ts # CEX interface definitions
│   │   ├── mexc/client.ts     # MEXC implementation
│   │   ├── binance/client.ts  # Binance implementation
│   │   └── index.ts           # Exchange factory
│   ├── auth/                  # Authentication middleware
│   └── public/                # Static assets (generated)
├── assets/                    # Source assets
│   ├── css/main.css          # Main CSS with Tailwind
│   └── js/                   # Client-side TypeScript
└── scripts/
    └── build-assets.ts       # Asset bundling script
```

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=sqlite:./database.db
```

### Exchange API Keys

API keys are managed through the web interface:

1. Navigate to **Exchange Settings**
2. Select your exchange (MEXC, Binance)
3. Enter API key and secret
4. Test connection before saving
5. Enable/disable exchanges as needed

## 🔌 Supported Exchanges

### MEXC
- ✅ Account balances
- ✅ Supported coins and networks
- ✅ Withdrawal functionality
- ✅ Network status checking
- ✅ Transaction history

### Binance
- ✅ Account balances  
- ✅ Supported coins and networks
- ✅ Withdrawal functionality
- ✅ Network status checking
- ✅ Transaction history

### Adding New Exchanges

1. Create client in `src/exchanges/[exchange]/client.ts`
2. Implement the `CEXInterface` from `src/exchanges/interfaces/base.ts`
3. Add to the factory in `src/exchanges/index.ts`
4. Test integration via the web interface

## 🛡️ Security

- **API Key Encryption**: Exchange credentials are securely stored in the database
- **Connection Testing**: Validate API keys before saving
- **Input Validation**: All user inputs validated with Zod schemas
- **Rate Limiting**: Built-in protection against API abuse
- **No Logging**: API keys and sensitive data never logged

## 📱 Usage

### Managing Wallets
1. Go to **Wallet Manager**
2. Add frequently used addresses with labels
3. Select wallets quickly during withdrawals

### Making Withdrawals
1. Navigate to **Withdraw**
2. Select exchange and coin
3. Choose or enter wallet address
4. Select network and enter amount
5. Review fees and confirm withdrawal

### Viewing History
1. Check **Transaction History**
2. Filter by exchange, coin, or status
3. Track withdrawal progress in real-time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Use TypeScript for all new code
- Add proper error handling and validation
- Test exchange integrations thoroughly
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Check `CLAUDE.md` for detailed development instructions
- **API Docs**: Exchange-specific documentation available via Context7 integration

## 🔮 Roadmap

- [ ] More exchange integrations (KuCoin, OKX, Bybit)
- [ ] Mobile-responsive improvements
- [ ] Advanced portfolio tracking
- [ ] Automated withdrawal scheduling
- [ ] Multi-signature wallet support
- [ ] Advanced fee optimization

---

**Note**: This is a development tool for personal use. Always verify withdrawals on exchange platforms and never share your API keys. Use testnet environments when possible during development.


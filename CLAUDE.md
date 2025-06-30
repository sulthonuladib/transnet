# CLAUDE.md

This file provides guidance to Claude Code when working with this CEX crypto withdraw system project.

## Project Overview

TransNet is a CEX (Centralized Exchange) crypto withdraw system built with modern web technologies. It provides a unified interface to manage crypto withdrawals across multiple exchanges with real-time network status checking and saved wallet management.

## Tech Stack

### Core Technologies

- **Runtime**: Bun (JavaScript runtime & toolkit)

  - Context7 Library: `/oven-sh/bun` - Trust Score: 9.4, 2426 code snippets
  - Ultra-fast JavaScript runtime, bundler, test runner, and package manager all-in-one
  - Native bundling capabilities for CSS and client-side assets

- **Backend Framework**: Hono (ultrafast web framework built on Web Standards)

  - Context7 Library: `/hono.dev-01d345b/llmstxt` - 2737 code snippets
  - Small, simple, and ultrafast web framework for any JavaScript runtime
  - Built on Web Standards, works seamlessly with Bun

- **Database**: SQLite with Drizzle ORM (TypeScript-first ORM)
  - Local SQLite database for development simplicity
  - Drizzle ORM provides type-safe database operations
  - Migration support for schema evolution

### Frontend Technologies

- **HTMX**: Hypermedia-driven architecture

  - Context7 Library: `/bigskysoftware/htmx` - Trust Score: 9.2, 632 code snippets
  - High power tools for HTML - enables modern web interactions without JavaScript frameworks
  - Used for dynamic content swapping, form submissions, and navigation

- **Hyperscript**: Optional client-side scripting (when HTMX isn't sufficient)
  - Context7 Library: `/bigskysoftware/_hyperscript` - Trust Score: 9.2, 482 code snippets
  - Small scripting language for the web, works seamlessly with HTMX
  - Use for complex client-side interactions that require more than HTMX attributes

### Styling & UI

- **Tailwind CSS 4**: Utility-first CSS framework

  - Context7 Library: `/tailwindlabs/tailwindcss.com` - Trust Score: 8.0, 2066 code snippets
  - Latest version with improved performance and new features
  - Utility-first approach for rapid UI development

- **DaisyUI 5**: Component library for Tailwind CSS
  - Context7 Library: `/saadeghi/daisyui` - Trust Score: 9.8, 1144 code snippets
  - Context7 Library: `/daisyui.com/llmstxt` - Trust Score: 9.0, 926 code snippets
  - Most popular, free and open-source Tailwind CSS component library
  - Provides pre-built components with consistent design system

## Commands

### Development

```bash
# Install dependencies
bun install

# Start development server (NOTE: Don't run this during Claude Code sessions - user runs it manually)
bun run dev

# Build CSS and client assets
bun run build:assets

# Database operations
bun run db:generate    # Generate migration from schema changes
bun run db:migrate     # Run pending migrations
bun run db:studio      # Open Drizzle Studio for database management
```

### Production

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## Project Structure

```
├── src/
│   ├── server/
│   │   └── index.tsx          # Main Hono server with all routes
│   ├── components/
│   │   ├── Layout.tsx         # Main layout component
│   │   ├── AuthForms.tsx      # Login/register forms
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── WithdrawForm.tsx   # Withdraw functionality
│   │   ├── WalletManager.tsx  # Saved wallet management
│   │   ├── TransactionHistory.tsx # Transaction tracking
│   │   └── ExchangeSettings.tsx # Exchange API configuration
│   ├── database/
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   ├── index.ts           # Database connection
│   │   └── migrations/        # Database migrations
│   ├── exchanges/
│   │   ├── interfaces/base.ts # CEX interface definitions
│   │   ├── mexc/client.ts     # MEXC exchange implementation
│   │   ├── binance/client.ts  # Binance exchange implementation
│   │   └── index.ts           # Exchange factory
│   ├── auth/
│   │   ├── middleware.ts      # Authentication middleware
│   │   └── utils.ts           # Auth utilities
│   └── public/
│       ├── css/               # Generated CSS files
│       └── js/                # Client-side scripts
├── assets/
│   ├── css/
│   │   └── main.css           # Main CSS with Tailwind imports
│   └── js/                    # Source client scripts
├── scripts/
│   └── build-assets.ts        # Asset bundling script
└── storage/                   # Local file storage
```

## Architecture

### Exchange Interface Pattern

All CEX integrations follow a standardized interface defined in `src/exchanges/interfaces/base.ts`:

```typescript
interface CEXInterface {
  name: string;
  getSupportedCoins(): Promise<Coin[]>;
  getBalance(coin?: string): Promise<Balance[]>;
  getNetworks(coin: string): Promise<Network[]>;
  withdraw(params: WithdrawParams): Promise<WithdrawResult>;
  checkNetworkStatus(coin: string, network: string): Promise<NetworkStatus>;
  getWithdrawHistory(coin?: string, limit?: number): Promise<any[]>;
  testConnection(): Promise<boolean>;
}
```

### Database Schema

- **users**: Simple authentication tracking
- **saved_wallets**: User-saved wallet addresses with labels
- **withdraw_history**: Transaction history and status tracking
- **exchange_configs**: Exchange-specific API key configurations

### Frontend Architecture

- **HTMX-driven**: Server-rendered HTML with dynamic behavior
- **Component-based**: Reusable TSX components using DaisyUI
- **Progressive Enhancement**: Works without JavaScript, enhanced with HTMX

## Key Features

### 1. Exchange API Key Management

- Secure storage of API keys per exchange
- Test connection functionality before saving
- Support for multiple exchanges (MEXC, Binance)
- Active/inactive status control
- Testnet mode support

### 2. Multi-Exchange Support

- Unified interface for multiple CEX platforms
- Real-time data from configured exchanges
- Automatic network status checking
- Consolidated balance and coin information

### 3. Saved Wallet Management

- Store frequently used wallet addresses
- Label wallets for easy identification
- Quick selection during withdrawals

### 4. Real-time Withdrawals

- Live data from exchange APIs
- Network status validation
- Fee calculation and display
- Transaction tracking and history

## External Documentation Access

This project uses **Context7 MCP Server** for accessing external API documentation. **Always use Context7 instead of local documentation files** for up-to-date and comprehensive information.

### Tech Stack Documentation via Context7:

#### Core Technologies:

- **Bun**: `/oven-sh/bun` - Runtime, bundler, test runner documentation
- **Hono**: `/hono.dev-01d345b/llmstxt` - Web framework patterns and best practices
- **HTMX**: `/bigskysoftware/htmx` - Hypermedia interactions, swapping, navigation
- **Hyperscript**: `/bigskysoftware/_hyperscript` - Client-side scripting when needed
- **Tailwind CSS**: `/tailwindlabs/tailwindcss.com` - Utility classes and responsive design
- **DaisyUI**: `/saadeghi/daisyui` - Component library usage and themes
- **Zod**: `/colinhacks/zod` - TypeScript-first schema validation with static type inference
- **Hono Zod Validator**: `/honojs/middleware` - Zod validation middleware for Hono

#### Exchange APIs:

- **MEXC**: `/suenot/mexc-docs-markdown` - Trust Score: 9.8, 130 code snippets
- **Binance**: `/binance/binance-spot-api-docs` - Trust Score: 7.7, 1208 code snippets

### Common Query Patterns:

1. **HTMX Issues**: Use topics like "hx-swap navigation", "hx-target swapping", "htmx attributes"
2. **Exchange Integration**: "withdraw API authentication", "signature generation examples"
3. **UI Components**: "daisyui modal", "tailwind responsive design"
4. **Bun Usage**: "bun bundler", "bun runtime features"

### Usage Example:

```bash
# Research HTMX swapping issues
mcp__context7__get-library-docs("/bigskysoftware/htmx", "hx-swap navigation htmx attributes")

# Get DaisyUI component examples
mcp__context7__get-library-docs("/saadeghi/daisyui", "modal dialog component")
```

## Development Guidelines

### Exchange Integration

- When adding new exchanges, follow the CEXInterface pattern
- Use Context7 to research the exchange's API documentation
- Implement proper signature generation and authentication
- Add comprehensive error handling and connection testing
- Follow the existing pattern in `mexc/client.ts` and `binance/client.ts`

### Database Operations

- Use Drizzle ORM for all database interactions
- Generate migrations for schema changes: `bun run db:generate`
- Always run migrations before deploying: `bun run db:migrate`

### API Development

- Follow Hono patterns for route definition
- Use TypeScript for strong typing with Zod validation schemas
- Implement proper error handling with validation middleware
- Return appropriate HTTP status codes with HTMX-friendly responses
- All routes are in `src/server/index.tsx`

#### Validation with Zod:

```typescript
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// Define validation schema
const withdrawSchema = z.object({
  exchange: z.string().min(1, 'Exchange is required'),
  coin: z.string().min(1, 'Coin is required'),
  amount: z.number().positive('Amount must be positive'),
  address: z.string().min(1, 'Address is required'),
  memo: z.string().optional()
});

// Use in route with custom error handler for HTMX
app.post('/api/withdraw',
  zValidator('json', withdrawSchema, (result, c) => {
    if (!result.success) {
      // Return HTMX-friendly validation errors
      c.header('HX-Trigger', createToastTrigger('Validation failed', 'error'));
      return c.html(
        <div class="alert alert-error">
          <span>Please check your input and try again.</span>
        </div>,
        400
      );
    }
  }),
  (c) => {
    const data = c.req.valid('json'); // Fully typed and validated
    // Handle withdrawal...
  }
);
```

### Frontend Development

#### HTMX Best Practices:

- **Navigation**: Use `hx-target="#main-content"` with `hx-swap="innerHTML"` for SPA-like navigation
- **Forms**: Prefer `hx-post` over traditional form submissions for better UX
- **Error Handling**: Return appropriate HTTP status codes and HTMX-friendly error messages
- **Progressive Enhancement**: Ensure all functionality works without JavaScript
- **HTMX Request Detection**: Check `HX-Request` header to return content-only vs full Layout
- **Server-Side Events**: Use response headers to trigger client-side events

#### HTMX Navigation Pattern:

```tsx
// In Layout.tsx - Navigation links with explicit swap
<a hx-get='/withdraw' hx-target='#main-content' hx-swap='innerHTML'>
  Withdraw
</a>;

// In server routes - Detect HTMX requests and return appropriate content
const isHtmxRequest = c.req.header('HX-Request');
if (isHtmxRequest) {
  return c.html(<WithdrawForm />); // Content only for navigation
}
return c.html(
  <Layout>
    <WithdrawForm />
  </Layout>
); // Full page for direct access
```

#### Server-Side Event Triggers:

HTMX allows servers to trigger client-side events via response headers:

```tsx
// Trigger client-side events from server
c.header('HX-Trigger', 'refreshBalance');
c.header(
  'HX-Trigger',
  '{"showNotification": {"message": "Success!", "type": "success"}}'
);

// Multiple events
c.header('HX-Trigger', 'refreshBalance, updateStatus');

// Trigger after content swap
c.header('HX-Trigger-After-Swap', 'scrollToTop');
c.header('HX-Trigger-After-Settle', 'highlightNew');
```

#### Hyperscript Integration:

For complex client-side interactions beyond HTMX capabilities:

```typescript
// Add to assets/scripts/hyperscript.ts (similar to htmx.ts)
import 'hyperscript.org';
```

```tsx
// In Layout.tsx - Include Hyperscript
<script src="/js/hyperscript.min.js"></script>

// Example usage in components
<button
  hx-post="/api/withdraw"
  hx-target="#result"
  _="on htmx:afterRequest wait 2s then add .highlight to #result"
>
  Submit Withdrawal
</button>

// Complex interactions
<div
  _="on click
     toggle .loading on me
     then fetch /api/status
     then put the result into #status
     then remove .loading from me"
>
  Refresh Status
</div>
```

#### DaisyUI Component Usage:

- Follow DaisyUI 5 component patterns from Context7 documentation
- Use semantic class names: `btn`, `card`, `modal`, `navbar`, etc.
- Leverage theme system with `data-theme` attribute
- Ensure accessibility with proper ARIA labels

### CSS/Styling

- Use Tailwind utility classes
- Leverage DaisyUI components when possible
- Custom CSS only when necessary
- Build assets with `bun run build:assets`

### Client-Side Development

- Use TypeScript for all client-side code in `/assets/js/` and `/assets/scripts/`
- Bundle client-side code using Bun's bundler: `bun build <input> --outfile <output>`
- Refer to [Bun documentation](/oven-sh/bun) for bundling patterns and configurations
- All client-side assets are processed through the build script and output to `/src/public/`

## Security Considerations

- Never log or expose API keys
- Validate all user inputs
- Use proper authentication middleware
- Implement rate limiting for API calls
- Secure storage of exchange credentials in database
- Test API connections before saving credentials

## Environment Variables

```bash
# Database
DATABASE_URL=sqlite:./database.db

# Server
PORT=3000
NODE_ENV=development
```

**Note**: Exchange API keys are now stored in the database via the web interface, not environment variables.

## Current Exchange Support

### MEXC

- **Client**: `src/exchanges/mexc/client.ts`
- **Authentication**: HMAC SHA256 signature
- **Endpoints**: Account info, balances, networks, withdrawals
- **Documentation**: Use Context7 with `/suenot/mexc-docs-markdown`

### Binance

- **Client**: `src/exchanges/binance/client.ts`
- **Authentication**: HMAC SHA256 signature
- **Endpoints**: Account info, balances, networks, withdrawals
- **Documentation**: Use Context7 with `/binance/binance-spot-api-docs`

## Testing

- Use Bun's built-in test runner
- Test exchange integrations with real testnet APIs when possible
- Ensure UI components work without JavaScript
- Test database operations with migrations

## Deployment Notes

- Build assets before deployment: `bun run build:assets`
- Ensure database migrations are applied
- Set production environment variables
- Configure proper CORS settings for production domains
- Set up proper logging and monitoring

## Adding New Exchanges

1. **Research API**: Use Context7 to access exchange documentation
2. **Create Client**: Follow the pattern in `src/exchanges/[exchange]/client.ts`
3. **Implement Interface**: Ensure all CEXInterface methods are implemented
4. **Update Factory**: Add the new exchange to `ExchangeFactory` in `src/exchanges/index.ts`
5. **Test Integration**: Use the built-in connection testing in the UI

## Memories

- Always use node modules bin folder if you want to run package command at ./node_modules/.bin
- Always search at documentation using context7 mcp server everytime i tell you to do something technical or with the related technology

```

```

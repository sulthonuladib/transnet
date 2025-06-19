import { MEXCClient } from './mexc/client';
import { BinanceClient } from './binance/client';
import type { CEXInterface } from './interfaces/base';

// Exchange factory to create client instances
export class ExchangeFactory {
  static createClient(exchangeName: string, apiKey: string, apiSecret: string, passphrase?: string): CEXInterface {
    switch (exchangeName.toLowerCase()) {
      case 'mexc':
        return new MEXCClient(apiKey, apiSecret);
      case 'binance':
        return new BinanceClient(apiKey, apiSecret);
      default:
        throw new Error(`Unsupported exchange: ${exchangeName}`);
    }
  }

  static getSupportedExchanges(): string[] {
    return ['mexc', 'binance', 'kucoin', 'bitget', 'bitmart', 'gateio'];
  }
}

// Export interfaces and types
export * from './interfaces/base';
export { MEXCClient, BinanceClient };

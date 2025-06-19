import crypto from 'crypto';
import type { CEXInterface, Coin, Balance, Network, WithdrawParams, WithdrawResult, NetworkStatus } from '../interfaces/base';

export class MEXCClient implements CEXInterface {
  public readonly name = 'MEXC';
  private readonly baseURL = 'https://api.mexc.com';
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private createSignature(queryString: string, timestamp: number): string {
    const message = `${queryString}&timestamp=${timestamp}`;
    return crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex').toLowerCase();
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now();
    const queryString = new URLSearchParams(params).toString();
    const signature = this.createSignature(queryString, timestamp);

    const url = `${this.baseURL}${endpoint}?${queryString}&timestamp=${timestamp}&signature=${signature}`;

    const response = await fetch(url, {
      method,
      headers: {
        'X-MEXC-APIKEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`MEXC API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSupportedCoins(): Promise<Coin[]> {
    const data = await this.makeRequest('/api/v3/exchangeInfo');
    const capitalConfig = await this.makeRequest('/api/v3/capital/config/getall');

    const coinMap = new Map<string, any>();

    // Build coin map from capital config
    for (const config of capitalConfig) {
      if (!coinMap.has(config.coin)) {
        coinMap.set(config.coin, {
          symbol: config.coin,
          name: config.Name || config.coin,
          networks: [],
          precision: 8,
          minWithdraw: Infinity,
          maxWithdraw: 0,
          withdrawEnabled: false,
          tradingEnabled: false,
        });
      }

      const coin = coinMap.get(config.coin);

      // Process networkList
      if (config.networkList && Array.isArray(config.networkList)) {
        for (const network of config.networkList) {
          coin.networks.push(network.network);
          coin.minWithdraw = Math.min(coin.minWithdraw, parseFloat(network.withdrawMin) || 0);
          coin.maxWithdraw = Math.max(coin.maxWithdraw, parseFloat(network.withdrawMax) || 0);
          coin.withdrawEnabled = coin.withdrawEnabled || network.withdrawEnable;
        }
      }
    }

    // Check trading status from exchange info
    for (const symbol of data.symbols) {
      const baseAsset = symbol.baseAsset;
      const quoteAsset = symbol.quoteAsset;

      if (coinMap.has(baseAsset)) {
        const coin = coinMap.get(baseAsset);
        coin.tradingEnabled = coin.tradingEnabled || symbol.status === 'TRADING';
      }

      if (coinMap.has(quoteAsset)) {
        const coin = coinMap.get(quoteAsset);
        coin.tradingEnabled = coin.tradingEnabled || symbol.status === 'TRADING';
      }
    }

    return Array.from(coinMap.values()).filter(coin => coin.networks.length > 0);
  }

  async getBalance(coin?: string): Promise<Balance[]> {
    const data = await this.makeRequest('/api/v3/account');

    return data.balances
      .filter((balance: any) => !coin || balance.asset === coin)
      .map((balance: any) => ({
        coin: balance.asset,
        free: parseFloat(balance.free),
        locked: parseFloat(balance.locked),
        total: parseFloat(balance.free) + parseFloat(balance.locked),
      }))
      .filter((balance: Balance) => balance.total > 0);
  }

  async getNetworks(coin: string): Promise<Network[]> {
    const capitalConfig = await this.makeRequest('/api/v3/capital/config/getall');

    const coinConfig = capitalConfig.find((config: any) => config.coin === coin);
    if (!coinConfig || !coinConfig.networkList) {
      return [];
    }

    return coinConfig.networkList.map((network: any) => ({
      network: network.network,
      coin: network.coin,
      name: network.network,
      withdrawEnabled: network.withdrawEnable,
      depositEnabled: network.depositEnable,
      withdrawFee: parseFloat(network.withdrawFee) || 0,
      minWithdraw: parseFloat(network.withdrawMin) || 0,
      maxWithdraw: parseFloat(network.withdrawMax) || 0,
      precision: 8, // Default precision
      memo: network.withdrawTips?.includes('MEMO') || network.depositTips?.includes('MEMO') || false,
      memoName: network.withdrawTips?.includes('MEMO') ? 'memo' : undefined,
      status: network.withdrawEnable && network.depositEnable ? 'active' : 'disabled',
      estimatedArrivalTime: undefined,
    }));
  }

  async withdraw(params: WithdrawParams): Promise<WithdrawResult> {
    try {
      const withdrawParams: Record<string, any> = {
        coin: params.coin,
        netWork: params.network, // Note: capital W in netWork for new API
        address: params.address,
        amount: params.amount.toString(),
      };

      if (params.tag) {
        withdrawParams.memo = params.tag;
      }

      const data = await this.makeRequest('/api/v3/capital/withdraw', 'POST', withdrawParams);

      return {
        success: true,
        orderId: data.id,
        message: 'Withdrawal request submitted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async checkNetworkStatus(coin: string, network: string): Promise<NetworkStatus> {
    const networks = await this.getNetworks(coin);
    const targetNetwork = networks.find(n => n.network === network);

    if (!targetNetwork) {
      return {
        network,
        coin,
        status: 'disabled',
        withdrawEnabled: false,
        depositEnabled: false,
      };
    }

    return {
      network: targetNetwork.network,
      coin: targetNetwork.coin,
      status: targetNetwork.status,
      withdrawEnabled: targetNetwork.withdrawEnabled,
      depositEnabled: targetNetwork.depositEnabled,
    };
  }

  async getWithdrawHistory(coin?: string, limit: number = 100): Promise<any[]> {
    const params: Record<string, any> = { limit };
    if (coin) {
      params.coin = coin;
    }

    const data = await this.makeRequest('/api/v3/capital/withdraw/history', 'GET', params);
    return data;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/api/v3/account');
      return true;
    } catch {
      return false;
    }
  }
}

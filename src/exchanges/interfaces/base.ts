// Base interfaces for all CEX integrations

export interface Coin {
  symbol: string;
  name: string;
  networks: string[];
  precision: number;
  minWithdraw: number;
  maxWithdraw: number;
  withdrawEnabled: boolean;
  tradingEnabled: boolean;
  exchange?: string; // Added for frontend display
}

export interface Network {
  network: string;
  coin: string;
  name: string;
  withdrawEnabled: boolean;
  depositEnabled: boolean;
  withdrawFee: number;
  minWithdraw: number;
  maxWithdraw: number;
  precision: number;
  memo?: boolean; // requires memo/tag
  memoName?: string; // name for memo field (tag, memo, etc)
  status: 'active' | 'maintenance' | 'disabled';
  estimatedArrivalTime?: number; // in minutes
}

export interface Balance {
  coin: string;
  free: number;
  locked: number;
  total: number;
  exchange?: string; // Added for frontend display
}

export interface WithdrawParams {
  coin: string;
  network: string;
  address: string;
  amount: number;
  tag?: string; // memo/tag for networks that require it
}

export interface WithdrawResult {
  success: boolean;
  orderId?: string;
  txId?: string;
  message?: string;
  error?: string;
  fee?: number;
}

export interface NetworkStatus {
  network: string;
  coin: string;
  status: 'active' | 'maintenance' | 'disabled';
  withdrawEnabled: boolean;
  depositEnabled: boolean;
  estimatedRecoveryTime?: number; // in minutes if in maintenance
}

// Base interface that all CEX implementations must follow
export interface CEXInterface {
  name: string;

  // Get all supported coins with their networks
  getSupportedCoins(): Promise<Coin[]>;

  // Get balance for specific coin or all coins
  getBalance(coin?: string): Promise<Balance[]>;

  // Get networks available for a specific coin
  getNetworks(coin: string): Promise<Network[]>;

  // Execute withdrawal
  withdraw(params: WithdrawParams): Promise<WithdrawResult>;

  // Check network status (for filtering unavailable networks)
  checkNetworkStatus(coin: string, network: string): Promise<NetworkStatus>;

  // Get withdrawal history
  getWithdrawHistory(coin?: string, limit?: number): Promise<any[]>;

  // Test API connection
  testConnection(): Promise<boolean>;
}

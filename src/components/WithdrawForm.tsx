import type { FC } from 'hono/jsx';
import type { Coin, Network, Balance } from '../exchanges/interfaces/base';

interface WithdrawFormProps {
  coins: Coin[];
  balances: Balance[];
  selectedCoin?: string;
  networks?: Network[];
  savedWallets?: Array<{
    id: string;
    label: string;
    address: string;
    coin: string;
    network: string;
    exchange: string;
  }>;
  exchangeErrors?: Record<string, string>;
  availableExchanges?: Array<{
    name: string;
    displayName: string;
  }>;
}

export const WithdrawForm: FC<WithdrawFormProps> = ({ coins, balances, selectedCoin, networks, savedWallets, exchangeErrors, availableExchanges }) => {
  return (
    <div class="max-w-2xl mx-auto">
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Withdraw Cryptocurrency</h2>
          
          {/* Exchange Errors */}
          {exchangeErrors && Object.keys(exchangeErrors).length > 0 && (
            <div class="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 class="font-bold">Exchange Connection Issues:</h3>
                <ul class="list-disc list-inside">
                  {Object.entries(exchangeErrors).map(([exchange, error]) => (
                    <li>{exchange}: {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <form id="withdraw-form" hx-post="/api/withdraw" hx-target="#withdraw-result">
            {/* Exchange Selection */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Exchange</span>
              </label>
              <select id="exchange-select" name="exchange" class="select select-bordered" required>
                <option value="">Select Exchange</option>
                {availableExchanges && availableExchanges.length > 0 ? (
                  availableExchanges.map(exchange => (
                    <option value={exchange.name}>{exchange.displayName}</option>
                  ))
                ) : (
                  <option value="" disabled>No exchanges configured</option>
                )}
              </select>
            </div>

            {/* Coin Selection */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Coin</span>
              </label>
              <select 
                name="coin" 
                class="select select-bordered" 
                required
                hx-get="/api/networks" 
                hx-target="#network-selection"
                hx-trigger="change"
                hx-include="[name='exchange']"
                _="on change 
                   set coinValue to my value
                   if coinValue is not ''
                     set selectedOption to my options[my selectedIndex]
                     set exchange to selectedOption.dataset.exchange
                     fetch `/api/balance?coin=${coinValue}&exchange=${exchange}`
                     then put the result into #balance-display
                   end"
              >
                <option value="">Select Coin</option>
                {coins.map(coin => {
                  const balance = balances.find(b => b.coin === coin.symbol && b.exchange === coin.exchange);
                  const hasBalance = balance && balance.free > 0;
                  
                  return (
                    <option 
                      value={coin.symbol} 
                      selected={coin.symbol === selectedCoin}
                      data-exchange={coin.exchange}
                      disabled={!hasBalance}
                      class={!hasBalance ? 'text-gray-400' : ''}
                    >
                      {coin.symbol} - {coin.name} 
                      {balance ? ` (${balance.free.toFixed(8)} available)` : ' (No balance)'}
                      [{coin.exchange?.toUpperCase() || 'UNKNOWN'}]
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Available Balance */}
            <div id="balance-display" class="form-control">
              <label class="label">
                <span class="label-text">Available Balance</span>
              </label>
              <div class="input input-bordered bg-base-300">
                <span id="balance-amount">Select a coin to see balance</span>
              </div>
            </div>

            {/* Network Selection */}
            <div id="network-selection" class="form-control">
              <label class="label">
                <span class="label-text">Network</span>
              </label>
              <select name="network" class="select select-bordered" required>
                <option value="">Select Network</option>
                {networks?.map(network => (
                  <option 
                    value={network.network}
                    disabled={!network.withdrawEnabled}
                    class={network.withdrawEnabled ? '' : 'text-gray-400'}
                  >
                    {network.network} 
                    {!network.withdrawEnabled && ' (Disabled)'}
                    {network.withdrawFee > 0 && ` - Fee: ${network.withdrawFee}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Amount</span>
                <span class="label-text-alt">
                  <button 
                    type="button" 
                    class="btn btn-xs btn-ghost"
                    id="max-amount-btn"
                    _="on click 
                       set maxBalance to the innerText of #balance-amount
                       if maxBalance contains ' '
                         set amount to maxBalance.split(' ')[0]
                         set #amount-input's value to amount
                       end"
                  >
                    Max
                  </button>
                </span>
              </label>
              <input 
                id="amount-input"
                type="number" 
                name="amount" 
                placeholder="0.00" 
                class="input input-bordered" 
                step="any"
                min="0"
                required 
                _="on input
                   set myValue to my value as a Number
                   set balanceText to the innerText of #balance-amount
                   if balanceText contains ' '
                     set maxBalance to balanceText.split(' ')[0] as a Number
                     if myValue > maxBalance
                       add .input-error to me
                       set #amount-error's innerText to 'Amount exceeds available balance'
                       show #amount-error
                     else
                       remove .input-error from me
                       hide #amount-error
                     end
                   end"
              />
              <div id="amount-error" class="label-text-alt text-error mt-1 hidden"></div>
            </div>

            {/* Address Selection */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Withdrawal Address</span>
              </label>
              
              {/* Saved Wallets */}
              {savedWallets && savedWallets.length > 0 && (
                <div class="mb-2">
                  <label class="label">
                    <span class="label-text-alt">Or select from saved wallets:</span>
                  </label>
                  <select 
                    class="select select-bordered w-full"
                    hx-get="/api/wallet-address"
                    hx-target="#address-input"
                    hx-trigger="change"
                    hx-swap="outerHTML"
                    hx-vals="js:{wallet: event.target.value}"
                  >
                    <option value="">Select saved wallet</option>
                    {savedWallets.map(wallet => (
                      <option value={wallet.id}>
                        {wallet.label} ({wallet.coin} - {wallet.network}) [{wallet.exchange.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <input 
                id="address-input"
                type="text" 
                name="address" 
                placeholder="Withdrawal address" 
                class="input input-bordered" 
                required 
              />
            </div>

            {/* Memo/Tag */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Memo/Tag (if required)</span>
              </label>
              <input 
                type="text" 
                name="memo" 
                placeholder="Enter memo or tag if required by network" 
                class="input input-bordered" 
              />
            </div>

            {/* Submit */}
            <div class="form-control mt-6">
              <button type="submit" class="btn btn-primary">
                <span class="htmx-indicator loading loading-spinner loading-sm"></span>
                Withdraw
              </button>
            </div>
          </form>

          {/* Result */}
          <div id="withdraw-result" class="mt-4"></div>
        </div>
      </div>
    </div>
  );
};
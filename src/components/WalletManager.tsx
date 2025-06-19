import type { FC } from 'hono/jsx';

interface SavedWallet {
  id: string;
  label: string;
  address: string;
  coin: string;
  network: string;
  exchange: string;
  createdAt: Date;
}

interface WalletManagerProps {
  wallets: SavedWallet[];
}

export const WalletManager: FC<WalletManagerProps> = ({ wallets }) => {
  return (
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Saved Wallets</h2>
        <button 
          class="btn btn-primary"
          hx-get="/wallets/add"
          hx-target="#wallet-form"
        >
          Add New Wallet
        </button>
      </div>

      {/* Add Wallet Form */}
      <div id="wallet-form" class="mb-6"></div>

      {/* Wallets List */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.length === 0 ? (
          <div class="col-span-full text-center py-8">
            <p class="text-gray-500">No saved wallets yet. Add your first wallet to get started.</p>
          </div>
        ) : (
          wallets.map(wallet => (
            <div class="card bg-base-200 shadow-xl">
              <div class="card-body">
                <h3 class="card-title text-lg">{wallet.label}</h3>
                <div class="space-y-2 text-sm">
                  <div>
                    <span class="font-semibold">Exchange:</span> {wallet.exchange.toUpperCase()}
                  </div>
                  <div>
                    <span class="font-semibold">Coin:</span> {wallet.coin}
                  </div>
                  <div>
                    <span class="font-semibold">Network:</span> {wallet.network}
                  </div>
                  <div>
                    <span class="font-semibold">Address:</span>
                    <div class="font-mono text-xs break-all bg-base-300 p-2 rounded mt-1">
                      {wallet.address}
                    </div>
                  </div>
                  <div class="text-xs text-gray-500">
                    Added: {new Date(wallet.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div class="card-actions justify-end mt-4">
                  <button 
                    class="btn btn-sm btn-outline"
                    hx-get={`/wallets/edit/${wallet.id}`}
                    hx-target="#wallet-form"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-error"
                    hx-delete={`/api/wallets/${wallet.id}`}
                    hx-target="closest .card"
                    hx-swap="outerHTML"
                    hx-confirm="Are you sure you want to delete this wallet?"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface AddWalletFormProps {
  availableExchanges?: Array<{
    name: string;
    displayName: string;
  }>;
  allCoins?: Array<{
    symbol: string;
    name: string;
    exchange: string;
  }>;
}

export const AddWalletForm: FC<AddWalletFormProps> = ({ availableExchanges = [], allCoins = [] }) => {
  return (
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Add New Wallet</h3>
        <form hx-post="/api/wallets" hx-target="#wallet-form" hx-swap="outerHTML">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Label</span>
              </label>
              <input 
                type="text" 
                name="label" 
                placeholder="My Main Wallet" 
                class="input input-bordered" 
                required 
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Exchange</span>
              </label>
              <select 
                id="exchange-select-wallet" 
                name="exchange" 
                class="select select-bordered" 
                required
                hx-get="/api/wallet-coins"
                hx-target="#coin-selection"
                hx-trigger="change"
                hx-include="this"
              >
                <option value="">Select Exchange</option>
                {availableExchanges.map(exchange => (
                  <option value={exchange.name}>{exchange.displayName}</option>
                ))}
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Coin</span>
              </label>
              <div id="coin-selection">
                <select name="coin" class="select select-bordered" required disabled>
                  <option value="">Select exchange first</option>
                </select>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Network</span>
              </label>
              <div id="network-selection-wallet">
                <select name="network" class="select select-bordered" required disabled>
                  <option value="">Select coin first</option>
                </select>
              </div>
            </div>

            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text">Wallet Address</span>
              </label>
              <input 
                type="text" 
                name="address" 
                placeholder="Enter wallet address" 
                class="input input-bordered" 
                required 
              />
            </div>
          </div>

          <div class="card-actions justify-end mt-4">
            <button 
              type="button" 
              class="btn btn-ghost"
              hx-get="/wallets"
              hx-target="#main-content"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              <span class="htmx-indicator loading loading-spinner loading-sm"></span>
              Save Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
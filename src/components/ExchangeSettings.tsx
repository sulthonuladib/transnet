import type { ExchangeConfig } from '../database/schema';
import { ExchangeFactory } from '../exchanges';

interface ExchangeSettingsProps {
  configs: ExchangeConfig[];
}

export function ExchangeSettings({ configs }: ExchangeSettingsProps) {
  const supportedExchanges = ExchangeFactory.getSupportedExchanges();

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Exchange Settings</h2>
        <div class="text-sm text-base-content/70">
          Configure your supported exchange API credentials
        </div>
      </div>

      <div class="grid gap-4">
        {supportedExchanges.map(exchangeName => {
          const config = configs.find(c => c.exchangeName === exchangeName);
          const isConfigured = config && config.apiKey && config.apiSecret;
          
          return (
            <div key={exchangeName} class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="avatar placeholder">
                      <div class="bg-neutral text-neutral-content rounded-full w-12">
                        <span class="text-xl">{exchangeName.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <h3 class="card-title capitalize">{exchangeName}</h3>
                      <div class="flex items-center space-x-2">
                        <div class={`badge ${isConfigured ? 'badge-success' : 'badge-warning'}`}>
                          {isConfigured ? 'Configured' : 'Not Configured'}
                        </div>
                        {config && (
                          <>
                            <div class={`badge ${config.isActive ? 'badge-info' : 'badge-neutral'}`}>
                              {config.isActive ? 'Active' : 'Inactive'}
                            </div>
                            {config.isActive && (
                              <div class={`badge ${config.isValid ? 'badge-success' : 'badge-warning'}`}>
                                {config.isValid ? '✓ Valid' : '⚠ Not Validated'}
                              </div>
                            )}
                          </>
                        )}
                        {config?.testnet && (
                          <div class="badge badge-outline">Testnet</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div class="card-actions">
                    {isConfigured && (
                      <button
                        class="btn btn-sm btn-outline btn-info"
                        hx-post={`/api/exchanges/${config.id}/test`}
                        hx-target="#test-result-${config.id}"
                        hx-swap="innerHTML"
                      >
                        Test Connection
                      </button>
                    )}
                    <button
                      class="btn btn-sm btn-outline"
                      hx-get={`/settings/exchanges/${isConfigured ? config.id : 'new'}?exchange=${exchangeName}`}
                      hx-target="#modal-content"
                      hx-swap="innerHTML"
                      onclick="document.getElementById('modal').showModal()"
                    >
                      {isConfigured ? 'Edit' : 'Configure'}
                    </button>
                    {isConfigured && (
                      <button
                        class="btn btn-sm btn-outline btn-error"
                        hx-delete={`/api/exchanges/${config.id}`}
                        hx-confirm="Are you sure you want to delete this exchange configuration?"
                        hx-target="closest .card"
                        hx-swap="outerHTML swap:1s"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                {isConfigured && (
                  <div id={`test-result-${config.id}`} class="mt-4"></div>
                )}
                
                {isConfigured && (
                  <div class="mt-4 text-sm text-base-content/70">
                    <p><strong>API Key:</strong> {config.apiKey?.slice(0, 8)}...{config.apiKey?.slice(-4)}</p>
                    <p><strong>Last Updated:</strong> {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : 'Never'}</p>
                    {config.lastValidationAt && (
                      <p><strong>Last Validation:</strong> {new Date(config.lastValidationAt).toLocaleString()}</p>
                    )}
                    {config.validationError && (
                      <p class="text-error"><strong>Validation Error:</strong> {config.validationError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding/editing exchanges */}
      <dialog id="modal" class="modal">
        <div class="modal-box">
          <div id="modal-content">
            {/* Content will be loaded here */}
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

interface ExchangeFormProps {
  exchange?: string;
  config?: ExchangeConfig;
}

export function ExchangeForm({ exchange, config }: ExchangeFormProps) {
  const isEdit = !!config;
  const exchangeName = exchange || config?.exchangeName || '';

  return (
    <div>
      <h3 class="font-bold text-lg mb-4">
        {isEdit ? `Edit ${exchangeName} Configuration` : `Configure ${exchangeName}`}
      </h3>
      
      <form
        hx-post={isEdit ? `/api/exchanges/${config.id}` : '/api/exchanges'}
        hx-target="#modal-content"
        hx-swap="innerHTML"
        class="space-y-4"
      >
        <input type="hidden" name="exchangeName" value={exchangeName} />
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">API Key</span>
          </label>
          <input
            type="text"
            name="apiKey"
            class="input input-bordered"
            value={config?.apiKey || ''}
            required
            placeholder="Enter your API key"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">API Secret</span>
          </label>
          <input
            type="password"
            name="apiSecret"
            class="input input-bordered"
            value={config?.apiSecret || ''}
            required
            placeholder="Enter your API secret"
          />
        </div>

        {exchangeName.toLowerCase() === 'okx' && (
          <div class="form-control">
            <label class="label">
              <span class="label-text">Passphrase</span>
            </label>
            <input
              type="password"
              name="passphrase"
              class="input input-bordered"
              value={config?.passphrase || ''}
              placeholder="Enter your passphrase (OKX only)"
            />
          </div>
        )}

        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">Testnet Mode</span>
            <input
              type="checkbox"
              name="testnet"
              class="checkbox"
              checked={config?.testnet || false}
            />
          </label>
        </div>

        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">Active</span>
            <input
              type="checkbox"
              name="isActive"
              class="checkbox"
              checked={config?.isActive !== false}
            />
          </label>
        </div>

        <div class="modal-action">
          <button type="submit" class="btn btn-primary">
            {isEdit ? 'Update' : 'Save'} Configuration
          </button>
          <button
            type="button"
            class="btn"
            onclick="document.getElementById('modal').close()"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
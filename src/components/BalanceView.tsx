import type { FC } from 'hono/jsx';

interface Balance {
  coin: string;
  free: number;
  locked: number;
  total: number;
  exchange: string;
  usdValue?: number;
}

interface BalanceViewProps {
  balances: Balance[];
  exchangeErrors?: Record<string, string>;
  page?: number;
  totalPages?: number;
}

export const BalanceView: FC<BalanceViewProps> = ({
  balances,
  exchangeErrors,
  page = 1,
  totalPages = 1,
}) => {
  // Sort balances by total value (highest first)
  const sortedBalances = balances
    .filter(balance => balance.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div class='mx-auto max-w-6xl'>
      <div class='mb-6 flex items-center justify-between'>
        <h1 class='text-3xl font-bold'>Balance Overview</h1>
        <button
          class='btn btn-primary'
          hx-get='/balances'
          hx-target='#main-content'
          hx-swap='innerHTML'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            class='mr-2 h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Exchange Errors */}
      {exchangeErrors && Object.keys(exchangeErrors).length > 0 && (
        <div class='alert alert-warning mb-6'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            class='h-6 w-6 shrink-0 stroke-current'
            fill='none'
            viewBox='0 0 24 24'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
          <div>
            <h3 class='font-bold'>Some exchanges failed to load:</h3>
            <ul class='list-inside list-disc'>
              {Object.entries(exchangeErrors).map(([exchange, error]) => (
                <li>
                  {exchange}: {error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Balance Summary Cards */}
      {sortedBalances.length === 0 ? (
        <div class='card bg-base-200 shadow-xl'>
          <div class='card-body text-center'>
            <h2 class='card-title justify-center'>No Balances Found</h2>
            <p class='text-base-content/70'>
              {Object.keys(exchangeErrors || {}).length > 0
                ? 'Unable to load balances due to exchange connection issues.'
                : "You don't have any cryptocurrency balances in your configured exchanges."}
            </p>
            <div class='card-actions justify-center'>
              <a href='/settings' class='btn btn-primary'>
                Check Exchange Settings
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Balance Grid */}
          <div class='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {sortedBalances.map(balance => (
              <div class='card bg-base-200 shadow-md'>
                <div class='card-body p-4'>
                  <div class='mb-2 flex items-start justify-between'>
                    <h3 class='card-title text-lg'>{balance.coin}</h3>
                    <div class='badge badge-sm badge-outline'>
                      {balance.exchange.toUpperCase()}
                    </div>
                  </div>

                  <div class='space-y-1 text-sm'>
                    <div class='flex justify-between'>
                      <span class='text-base-content/70'>Available:</span>
                      <span class='font-mono'>{balance.free.toFixed(8)}</span>
                    </div>

                    {balance.locked > 0 && (
                      <div class='flex justify-between'>
                        <span class='text-base-content/70'>Locked:</span>
                        <span class='text-warning font-mono'>
                          {balance.locked.toFixed(8)}
                        </span>
                      </div>
                    )}

                    <div class='flex justify-between border-t pt-1'>
                      <span class='font-semibold'>Total:</span>
                      <span class='font-mono font-semibold'>
                        {balance.total.toFixed(8)}
                      </span>
                    </div>

                    {balance.usdValue && (
                      <div class='flex justify-between'>
                        <span class='text-base-content/70'>USD Value:</span>
                        <span class='text-success font-mono'>
                          ${balance.usdValue.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div class='card-actions mt-3 justify-end'>
                    <button
                      class='btn btn-xs btn-primary'
                      hx-get={`/withdraw?coin=${balance.coin}&exchange=${balance.exchange}`}
                      hx-target='#main-content'
                      hx-swap='innerHTML'
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div class='flex justify-center'>
              <div class='join'>
                {page > 1 && (
                  <button
                    class='join-item btn'
                    hx-get={`/balances?page=${page - 1}`}
                    hx-target='#main-content'
                    hx-swap='innerHTML'
                  >
                    «
                  </button>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(
                    1,
                    Math.min(totalPages, page - 2 + i)
                  );
                  return (
                    <button
                      class={`join-item btn ${pageNum === page ? 'btn-active' : ''}`}
                      hx-get={`/balances?page=${pageNum}`}
                      hx-target='#main-content'
                      hx-swap='innerHTML'
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {page < totalPages && (
                  <button
                    class='join-item btn'
                    hx-get={`/balances?page=${page + 1}`}
                    hx-target='#main-content'
                    hx-swap='innerHTML'
                  >
                    »
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

import type { FC } from 'hono/jsx';

interface Transaction {
  id: string;
  exchangeName: string;
  coin: string;
  network: string;
  amount: number;
  address: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txId?: string;
  fee?: number;
  error?: string;
  createdAt: Date;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: FC<TransactionHistoryProps> = ({
  transactions,
}) => {
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'badge-warning',
      processing: 'badge-info',
      completed: 'badge-success',
      failed: 'badge-error',
    };

    return (
      <span
        class={`badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-neutral'}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div class='mx-auto max-w-6xl'>
      <div class='mb-6 flex items-center justify-between'>
        <h2 class='text-2xl font-bold'>Transaction History</h2>
        <button
          class='btn btn-outline'
          hx-get='/history'
          hx-target='#main-content'
        >
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div class='py-8 text-center'>
          <p class='text-gray-500'>
            No transactions yet. Start your first withdrawal!
          </p>
          <button
            class='btn btn-primary mt-4'
            hx-get='/withdraw'
            hx-target='#main-content'
          >
            Start Withdrawal
          </button>
        </div>
      ) : (
        <div class='overflow-x-auto'>
          <table class='table-zebra table w-full'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Exchange</th>
                <th>Asset</th>
                <th>Network</th>
                <th>Amount</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr class='hover'>
                  <td>
                    <div class='font-mono text-sm'>
                      {new Date(tx.createdAt).toLocaleDateString()}
                      <br />
                      <span class='text-xs text-gray-500'>
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class='flex items-center space-x-2'>
                      <div class='badge badge-outline'>{tx.exchangeName}</div>
                    </div>
                  </td>
                  <td>
                    <div class='font-semibold'>{tx.coin}</div>
                    <div class='text-sm text-gray-500'>{tx.network}</div>
                  </td>
                  <td>{tx.network}</td>
                  <td>
                    <div class='font-mono'>
                      {tx.amount} {tx.coin}
                      {tx.fee && (
                        <div class='text-xs text-gray-500'>
                          Fee: {tx.fee} {tx.coin}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div
                      class='max-w-xs truncate font-mono text-xs'
                      title={tx.address}
                    >
                      {tx.address}
                    </div>
                  </td>
                  <td>{getStatusBadge(tx.status)}</td>
                  <td>
                    <div class='flex space-x-2'>
                      <button
                        class='btn btn-xs btn-outline'
                        hx-get={`/api/transaction/${tx.id}`}
                        hx-target='#transaction-details'
                        hx-swap='innerHTML'
                        onclick="document.getElementById('transaction-modal').showModal()"
                      >
                        Details
                      </button>
                      {tx.txId && (
                        <a
                          href={`https://explorer.example.com/tx/${tx.txId}`}
                          target='_blank'
                          class='btn btn-xs btn-primary'
                        >
                          Explorer
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Details Modal */}
      <dialog id='transaction-modal' class='modal'>
        <div class='modal-box'>
          <h3 class='text-lg font-bold'>Transaction Details</h3>
          <div id='transaction-details'>
            {/* Details will be loaded here */}
          </div>
          <div class='modal-action'>
            <form method='dialog'>
              <button class='btn'>Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export const TransactionDetails: FC<{ transaction: Transaction }> = ({
  transaction,
}) => {
  return (
    <div class='py-4'>
      <div class='grid grid-cols-2 gap-4'>
        <div>
          <strong>Transaction ID:</strong>
          <div class='font-mono text-sm'>{transaction.id}</div>
        </div>
        <div>
          <strong>Exchange Order ID:</strong>
          <div class='font-mono text-sm'>{transaction.txId || 'N/A'}</div>
        </div>
        <div>
          <strong>Date:</strong>
          <div>{new Date(transaction.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <strong>Status:</strong>
          <div class='mt-1'>
            <span
              class={`badge ${
                transaction.status === 'completed'
                  ? 'badge-success'
                  : transaction.status === 'failed'
                    ? 'badge-error'
                    : transaction.status === 'processing'
                      ? 'badge-info'
                      : 'badge-warning'
              }`}
            >
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
            </span>
          </div>
        </div>
        <div>
          <strong>Amount:</strong>
          <div>
            {transaction.amount} {transaction.coin}
          </div>
        </div>
        <div>
          <strong>Fee:</strong>
          <div>
            {transaction.fee || 0} {transaction.coin}
          </div>
        </div>
        <div class='col-span-2'>
          <strong>Withdrawal Address:</strong>
          <div class='bg-base-200 mt-1 rounded p-2 font-mono text-sm break-all'>
            {transaction.address}
          </div>
        </div>
        {transaction.error && (
          <div class='col-span-2'>
            <strong>Error:</strong>
            <div class='text-error bg-error/10 mt-1 rounded p-2'>
              {transaction.error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

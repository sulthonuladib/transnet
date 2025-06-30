import type { FC } from 'hono/jsx';

interface InvitationCode {
  id: string;
  code: string;
  description?: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export const InvitationManager: FC = () => {
  return (
    <div class='space-y-6'>
      <div class='flex items-center justify-between'>
        <h2 class='text-2xl font-bold'>Invitation Codes</h2>
        <button
          class='btn btn-primary'
          onclick='document.getElementById("create-code-modal").showModal()'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke-width='1.5'
            stroke='currentColor'
            class='mr-2 h-5 w-5'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              d='M12 4.5v15m7.5-7.5h-15'
            />
          </svg>
          Create Code
        </button>
      </div>

      {/* Create Code Modal */}
      <dialog id='create-code-modal' class='modal'>
        <div class='modal-box'>
          <h3 class='mb-4 text-lg font-bold'>Create Invitation Code</h3>
          <form
            hx-post='/api/invitation-codes'
            hx-target='#create-result'
            hx-swap='innerHTML'
          >
            <div class='form-control mb-4'>
              <label class='label'>
                <span class='label-text'>Description (Optional)</span>
              </label>
              <input
                type='text'
                name='description'
                placeholder='e.g., For new team members'
                class='input input-bordered'
              />
            </div>

            <div class='form-control mb-4'>
              <label class='label'>
                <span class='label-text'>Max Uses</span>
              </label>
              <input
                type='number'
                name='maxUses'
                value='1'
                min='1'
                max='1000'
                class='input input-bordered'
                required
              />
            </div>

            <div class='form-control mb-4'>
              <label class='label'>
                <span class='label-text'>Expires At</span>
              </label>
              <input
                type='datetime-local'
                name='expiresAt'
                class='input input-bordered'
                required
              />
            </div>

            <div id='create-result' class='mb-4'></div>

            <div class='modal-action'>
              <button type='submit' class='btn btn-primary'>
                <span class='htmx-indicator loading loading-spinner loading-sm'></span>
                Create Code
              </button>
              <button
                type='button'
                class='btn btn-ghost'
                onclick='document.getElementById("create-code-modal").close()'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        <form method='dialog' class='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>

      {/* Invitation Codes List */}
      <div
        id='invitation-codes-list'
        hx-get='/api/invitation-codes-list'
        hx-trigger='load, refreshCodes from:body'
      >
        <div class='flex justify-center py-8'>
          <span class='loading loading-spinner loading-lg'></span>
        </div>
      </div>
    </div>
  );
};

interface InvitationCodeListProps {
  codes: InvitationCode[];
}

export const InvitationCodeList: FC<InvitationCodeListProps> = ({ codes }) => {
  if (codes.length === 0) {
    return (
      <div class='py-8 text-center'>
        <div class='text-gray-500'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke-width='1.5'
            stroke='currentColor'
            class='mx-auto mb-4 h-12 w-12'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.375a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.375a2.25 2.25 0 002.25 2.25z'
            />
          </svg>
          <h3 class='mb-2 text-lg font-medium'>No invitation codes</h3>
          <p>
            Create your first invitation code to allow new users to register.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div class='overflow-x-auto'>
      <table class='table-zebra table w-full'>
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
            <th>Usage</th>
            <th>Expires</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(code => {
            const isExpired = new Date(code.expiresAt) < new Date();
            const isMaxedOut = code.usedCount >= code.maxUses;
            const canUse = code.isActive && !isExpired && !isMaxedOut;

            return (
              <tr key={code.id}>
                <td>
                  <div class='font-mono text-lg font-bold'>{code.code}</div>
                </td>
                <td>
                  <div class='max-w-xs truncate'>
                    {code.description || (
                      <span class='text-gray-400 italic'>No description</span>
                    )}
                  </div>
                </td>
                <td>
                  <div class='flex items-center gap-2'>
                    <span
                      class={`badge ${isMaxedOut ? 'badge-error' : 'badge-info'}`}
                    >
                      {code.usedCount}/{code.maxUses}
                    </span>
                    <progress
                      class={`progress w-16 ${isMaxedOut ? 'progress-error' : 'progress-info'}`}
                      value={code.usedCount}
                      max={code.maxUses}
                    ></progress>
                  </div>
                </td>
                <td>
                  <div
                    class={`text-sm ${isExpired ? 'text-error' : 'text-gray-600'}`}
                  >
                    {new Date(code.expiresAt).toLocaleDateString()}{' '}
                    {new Date(code.expiresAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </td>
                <td>
                  <div class='flex flex-col gap-1'>
                    <span
                      class={`badge badge-sm ${canUse ? 'badge-success' : 'badge-error'}`}
                    >
                      {canUse ? 'Active' : 'Inactive'}
                    </span>
                    {isExpired && (
                      <span class='badge badge-sm badge-warning'>Expired</span>
                    )}
                    {isMaxedOut && (
                      <span class='badge badge-sm badge-error'>Max Used</span>
                    )}
                  </div>
                </td>
                <td>
                  <div class='flex gap-2'>
                    <button
                      class={`btn btn-sm ${code.isActive ? 'btn-warning' : 'btn-success'}`}
                      hx-patch={`/api/invitation-codes/${code.id}/toggle`}
                      hx-target='closest tr'
                      hx-swap='outerHTML'
                      title={code.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {code.isActive ? (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke-width='1.5'
                          stroke='currentColor'
                          class='h-4 w-4'
                        >
                          <path
                            stroke-linecap='round'
                            stroke-linejoin='round'
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke-width='1.5'
                          stroke='currentColor'
                          class='h-4 w-4'
                        >
                          <path
                            stroke-linecap='round'
                            stroke-linejoin='round'
                            d='M4.5 12.75l6 6 9-13.5'
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      class='btn btn-sm btn-error'
                      hx-delete={`/api/invitation-codes/${code.id}`}
                      hx-target='closest tr'
                      hx-swap='outerHTML'
                      hx-confirm='Are you sure you want to delete this invitation code?'
                      title='Delete'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke-width='1.5'
                        stroke='currentColor'
                        class='h-4 w-4'
                      >
                        <path
                          stroke-linecap='round'
                          stroke-linejoin='round'
                          d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

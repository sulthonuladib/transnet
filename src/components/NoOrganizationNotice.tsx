import type { FC } from 'hono/jsx';

export const NoOrganizationNotice: FC = () => {
  return (
    <div class='alert alert-warning shadow-lg'>
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
          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        />
      </svg>
      <div>
        <h3 class='font-bold'>No Organization Selected</h3>
        <div class='text-sm'>
          You need to create or join an organization to use TransNet features.
        </div>
      </div>
      <div>
        <button
          class='btn btn-sm'
          hx-get='/organizations'
          hx-target='#main-content'
          hx-swap='innerHTML'
        >
          Manage Organizations
        </button>
      </div>
    </div>
  );
};

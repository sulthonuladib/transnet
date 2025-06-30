import type { FC } from 'hono/jsx';

interface LoginFormProps {
  errors?: {
    general?: string;
    username?: string;
    password?: string;
  };
  values?: {
    username?: string;
    password?: string;
  };
}

export const LoginForm: FC<LoginFormProps> = ({ errors = {}, values = {} }) => {
  return (
    <div class='flex min-h-[70vh] items-center justify-center'>
      <div class='card bg-base-200 w-full max-w-md shadow-2xl'>
        <div class='card-body'>
          <h2 class='card-title mb-6 justify-center text-3xl font-bold'>
            Login to TransNet
          </h2>
          {errors.general && (
            <div class='alert alert-error mb-4'>
              <span>{errors.general}</span>
            </div>
          )}
          <form hx-post='/login' hx-target='#main-content' hx-swap='innerHTML'>
            <div class='form-control'>
              <label class='label'>
                <span class='label-text'>Username</span>
              </label>
              <input
                type='text'
                name='username'
                placeholder='Enter your username'
                class={`input input-bordered input-primary ${errors.username ? 'input-error' : ''}`}
                value={values.username || ''}
                required
              />
              {errors.username && (
                <label class='label'>
                  <span class='label-text-alt text-error'>
                    {errors.username}
                  </span>
                </label>
              )}
            </div>
            <div class='form-control'>
              <label class='label'>
                <span class='label-text'>Password</span>
              </label>
              <input
                type='password'
                name='password'
                placeholder='Enter your password'
                class={`input input-bordered input-primary ${errors.password ? 'input-error' : ''}`}
                required
              />
              {errors.password && (
                <label class='label'>
                  <span class='label-text-alt text-error'>
                    {errors.password}
                  </span>
                </label>
              )}
            </div>
            <div class='form-control mt-6'>
              <button type='submit' class='btn btn-primary'>
                <span class='htmx-indicator loading loading-spinner loading-sm'></span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke-width='1.5'
                  stroke='currentColor'
                  class='htmx-indicator-hide mr-2 h-5 w-5'
                >
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9'
                  />
                </svg>
                Login
              </button>
            </div>
          </form>
          <div class='divider'>OR</div>
          <button
            class='btn btn-outline'
            hx-get='/register'
            hx-target='#main-content'
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
                d='M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z'
              />
            </svg>
            Register New Account
          </button>
        </div>
      </div>
    </div>
  );
};

interface RegisterFormProps {
  errors?: {
    general?: string;
    username?: string;
    email?: string;
    password?: string;
  };
  values?: {
    username?: string;
    email?: string;
    password?: string;
  };
}

export const RegisterForm: FC<RegisterFormProps> = ({
  errors = {},
  values = {},
}) => {
  return (
    <div class='card bg-base-200 mx-auto w-96 shadow-xl'>
      <div class='card-body'>
        <h2 class='card-title justify-center'>Register</h2>
        {errors.general && (
          <div class='alert alert-error mb-4'>
            <span>{errors.general}</span>
          </div>
        )}
        <form hx-post='/register' hx-target='#main-content' hx-swap='innerHTML'>
          <div class='form-control'>
            <label class='label'>
              <span class='label-text'>Username</span>
            </label>
            <input
              type='text'
              name='username'
              placeholder='Username'
              class={`input input-bordered ${errors.username ? 'input-error' : ''}`}
              value={values.username || ''}
              required
            />
            {errors.username && (
              <label class='label'>
                <span class='label-text-alt text-error'>{errors.username}</span>
              </label>
            )}
          </div>
          <div class='form-control'>
            <label class='label'>
              <span class='label-text'>Email</span>
            </label>
            <input
              type='email'
              name='email'
              placeholder='Email'
              class={`input input-bordered ${errors.email ? 'input-error' : ''}`}
              value={values.email || ''}
              required
            />
            {errors.email && (
              <label class='label'>
                <span class='label-text-alt text-error'>{errors.email}</span>
              </label>
            )}
          </div>
          <div class='form-control'>
            <label class='label'>
              <span class='label-text'>Password</span>
            </label>
            <input
              type='password'
              name='password'
              placeholder='Password'
              class={`input input-bordered ${errors.password ? 'input-error' : ''}`}
              required
            />
            {errors.password && (
              <label class='label'>
                <span class='label-text-alt text-error'>{errors.password}</span>
              </label>
            )}
          </div>
          <div class='form-control mt-6'>
            <button type='submit' class='btn btn-primary'>
              <span class='htmx-indicator loading loading-spinner loading-sm'></span>
              Register
            </button>
          </div>
        </form>
        <div class='divider'>OR</div>
        <button class='btn btn-ghost' hx-get='/login' hx-target='#main-content'>
          Login to Existing Account
        </button>
      </div>
    </div>
  );
};

import type { FC } from 'hono/jsx';

export const LoginForm: FC = () => {
  return (
    <div class="flex items-center justify-center min-h-[70vh]">
      <div class="card w-full max-w-md bg-base-200 shadow-2xl">
        <div class="card-body">
          <h2 class="card-title text-3xl font-bold justify-center mb-6">Login to TransNet</h2>
          <form hx-post="/login" hx-target="#main-content">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Username</span>
              </label>
              <input 
                type="text" 
                name="username" 
                placeholder="Enter your username" 
                class="input input-bordered input-primary" 
                required 
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <input 
                type="password" 
                name="password" 
                placeholder="Enter your password" 
                class="input input-bordered input-primary" 
                required 
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Organization (Optional)</span>
              </label>
              <input 
                type="text" 
                name="organizationSlug" 
                placeholder="Enter organization code or leave empty" 
                class="input input-bordered input-primary" 
              />
              <div class="label">
                <span class="label-text-alt">Leave empty to use personal account</span>
              </div>
            </div>
            <div class="form-control mt-6">
              <button type="submit" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Login
              </button>
            </div>
          </form>
          <div class="divider">OR</div>
          <button class="btn btn-outline" hx-get="/register" hx-target="#main-content">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            Register New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export const RegisterForm: FC = () => {
  return (
    <div class="card w-96 bg-base-200 shadow-xl mx-auto">
      <div class="card-body">
        <h2 class="card-title justify-center">Register</h2>
        <form hx-post="/register" hx-target="#main-content">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Username</span>
            </label>
            <input type="text" name="username" placeholder="Username" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input type="email" name="email" placeholder="Email" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input type="password" name="password" placeholder="Password" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Organization (Optional)</span>
            </label>
            <input type="text" name="organizationSlug" placeholder="Enter organization code or leave empty" class="input input-bordered" />
            <div class="label">
              <span class="label-text-alt">Leave empty to use personal account</span>
            </div>
          </div>
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">Register</button>
          </div>
        </form>
        <div class="divider">OR</div>
        <button class="btn btn-ghost" hx-get="/login" hx-target="#main-content">Login to Existing Account</button>
      </div>
    </div>
  );
};
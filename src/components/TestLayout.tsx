import type { FC } from 'hono/jsx';

export const TestLayout: FC = () => {
  return (
    <html data-theme='light'>
      <head>
        <meta charset='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Test Layout</title>
        <link rel='stylesheet' href='/css/main.css' />
      </head>
      <body>
        <div class='bg-base-100 min-h-screen'>
          <div class='navbar bg-primary text-primary-content'>
            <div class='navbar-start'>
              <a class='btn btn-ghost text-xl'>TransNet</a>
            </div>
            <div class='navbar-center'>
              <ul class='menu menu-horizontal px-1'>
                <li>
                  <a>Dashboard</a>
                </li>
                <li>
                  <a>Withdraw</a>
                </li>
                <li>
                  <a>Wallets</a>
                </li>
                <li>
                  <a>History</a>
                </li>
              </ul>
            </div>
            <div class='navbar-end'>
              <button class='btn'>Login</button>
            </div>
          </div>

          <div class='container mx-auto p-4'>
            <div class='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div class='card bg-base-200 shadow-xl'>
                <div class='card-body'>
                  <h2 class='card-title'>Card 1</h2>
                  <p>If a dog chews shoes whose shoes does he choose?</p>
                  <div class='card-actions justify-end'>
                    <button class='btn btn-primary'>Buy Now</button>
                  </div>
                </div>
              </div>

              <div class='card bg-base-200 shadow-xl'>
                <div class='card-body'>
                  <h2 class='card-title'>Card 2</h2>
                  <p>If a dog chews shoes whose shoes does he choose?</p>
                  <div class='card-actions justify-end'>
                    <button class='btn btn-secondary'>Buy Now</button>
                  </div>
                </div>
              </div>

              <div class='card bg-base-200 shadow-xl'>
                <div class='card-body'>
                  <h2 class='card-title'>Card 3</h2>
                  <p>If a dog chews shoes whose shoes does he choose?</p>
                  <div class='card-actions justify-end'>
                    <button class='btn btn-accent'>Buy Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

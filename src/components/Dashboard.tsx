import type { FC } from 'hono/jsx';

export const Dashboard: FC = () => {
	return (
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-2">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
						</svg>
						Quick Withdraw
					</h2>
					<p class="text-base-content/70">Start a new withdrawal to any supported exchange</p>
					<div class="card-actions justify-end mt-4">
						<button class="btn btn-primary" hx-get="/withdraw" hx-target="#main-content">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
							</svg>
							Withdraw
						</button>
					</div>
				</div>
			</div>

			<div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-2">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
						</svg>
						Saved Wallets
					</h2>
					<p class="text-base-content/70">Manage your frequently used wallet addresses</p>
					<div class="card-actions justify-end mt-4">
						<button class="btn btn-secondary" hx-get="/wallets" hx-target="#main-content">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							Manage
						</button>
					</div>
				</div>
			</div>

			<div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
				<div class="card-body">
					<h2 class="card-title text-2xl mb-2">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Transaction History
					</h2>
					<p class="text-base-content/70">View your withdrawal history and status</p>
					<div class="card-actions justify-end mt-4">
						<button class="btn btn-accent" hx-get="/history" hx-target="#main-content">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
							</svg>
							View History
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export const Welcome: FC = () => {
	return (
		<div class="hero min-h-[80vh] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl">
			<div class="hero-content text-center">
				<div class="max-w-2xl">
					<h1 class="text-6xl font-bold text-base-content mb-8">
						Welcome to <span class="text-primary">TransNet</span>
					</h1>
					<p class="text-xl text-base-content/80 mb-8">
						Multi-exchange crypto withdrawal management system. Manage your withdrawals across multiple CEX platforms with ease.
					</p>
					<div class="flex flex-col sm:flex-row gap-4 justify-center">
						<button class="btn btn-primary btn-lg" hx-get="/register" hx-target="#main-content">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
							</svg>
							Get Started
						</button>
						<button class="btn btn-outline btn-lg" hx-get="/login" hx-target="#main-content">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
							</svg>
							Login
						</button>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
						<div class="card bg-base-100 shadow-lg">
							<div class="card-body text-center">
								<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
									</svg>
								</div>
								<h3 class="text-lg font-semibold">Secure</h3>
								<p class="text-sm text-base-content/70">Your keys, your crypto. We never store your private keys.</p>
							</div>
						</div>
						
						<div class="card bg-base-100 shadow-lg">
							<div class="card-body text-center">
								<div class="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-secondary">
										<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
									</svg>
								</div>
								<h3 class="text-lg font-semibold">Fast</h3>
								<p class="text-sm text-base-content/70">Quick withdrawals with real-time network status checking.</p>
							</div>
						</div>
						
						<div class="card bg-base-100 shadow-lg">
							<div class="card-body text-center">
								<div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-accent">
										<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
									</svg>
								</div>
								<h3 class="text-lg font-semibold">Multi-Exchange</h3>
								<p class="text-sm text-base-content/70">Support for multiple CEX platforms in one place.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

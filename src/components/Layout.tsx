import type { FC, PropsWithChildren } from 'hono/jsx';
import { ToastContainer } from './Toast';

interface LayoutProps {
	title: string;
	user?: { username: string };
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({ title, user, children }) => {
	return (
		<html data-theme="dark">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<link rel="stylesheet" href="/css/main.css" />
				<script src="/js/htmx.min.js"></script>
				<script src="/js/hyperscript.min.js"></script>
				<script src="/js/error-handling.min.js"></script>
			</head>
			<body>
				<div class="min-h-screen bg-base-100 flex flex-col">
					<div class="navbar bg-primary text-primary-content shadow-lg">
						<div class="navbar-start">
							<a class="btn btn-ghost text-xl">TransNet</a>
						</div>
						{user && (
							<div class="navbar-center hidden lg:flex">
								<ul class="menu menu-horizontal px-1">
									<li><a hx-get="/dashboard" hx-target="#main-content" hx-swap="innerHTML">Dashboard</a></li>
									<li><a hx-get="/balances" hx-target="#main-content" hx-swap="innerHTML">Balances</a></li>
									<li><a hx-get="/withdraw" hx-target="#main-content" hx-swap="innerHTML">Withdraw</a></li>
									<li><a hx-get="/wallets" hx-target="#main-content" hx-swap="innerHTML">Saved Wallets</a></li>
									<li><a hx-get="/history" hx-target="#main-content" hx-swap="innerHTML">History</a></li>
									<li><a hx-get="/settings" hx-target="#main-content" hx-swap="innerHTML">Settings</a></li>
								</ul>
							</div>
						)}
						<div class="navbar-end">
							{user ? (
								<div class="dropdown dropdown-end">
									<div tabIndex={0} role="button" class="btn btn-ghost">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										<span>{user.username}</span>
									</div>
									<ul tabIndex={0} class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[1]">
										<li><a hx-post="/logout" hx-trigger="click">Logout</a></li>
									</ul>
								</div>
							) : (
								<div class="flex gap-2">
									<button class="btn btn-ghost btn-sm" hx-get="/login" hx-target="#main-content">Login</button>
									<button class="btn btn-primary btn-sm" hx-get="/register" hx-target="#main-content">Register</button>
								</div>
							)}
						</div>
					</div>

					<main class="flex-1">
						<div id="main-content" class="container mx-auto p-6 max-w-7xl">
							{children}
						</div>
					</main>
					
					<ToastContainer />
				</div>
			</body>
		</html>
	);
};

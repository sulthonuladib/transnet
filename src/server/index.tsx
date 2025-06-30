import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
	createInsertSchema,
	createSelectSchema as _createSelectSchema,
} from 'drizzle-zod';
import {
	authMiddleware,
	optionalAuthMiddleware,
	generateToken,
} from '../auth/middleware';
import { registerUser, authenticateUser, hashPassword } from '../auth/utils';
import { ExchangeFactory } from '../exchanges';
import {
	db,
	savedWallets,
	withdrawHistory,
	exchangeConfigs,
	users,
	organizations,
	activityLog,
} from '../database';
import { eq, desc, and } from 'drizzle-orm';

// Components
import { Layout } from '../components/Layout';
import { LoginForm, RegisterForm } from '../components/AuthForms';
import { Dashboard, Welcome } from '../components/Dashboard';
import { WithdrawForm } from '../components/WithdrawForm';
import { WalletManager, AddWalletForm } from '../components/WalletManager';
import {
	TransactionHistory,
	TransactionDetails,
} from '../components/TransactionHistory';
import { ExchangeSettings, ExchangeForm } from '../components/ExchangeSettings';
import { BalanceView } from '../components/BalanceView';
import { createToastTrigger } from '../components/Toast';
import { OrganizationManager, OrganizationSettings } from '../components/OrganizationManager';
import { NoOrganizationNotice } from '../components/NoOrganizationNotice';

// Helper function to require organization access
function requireOrganization(c: any) {
	const organization = c.get('organization');
	if (!organization) {
		c.header(
			'HX-Trigger',
			createToastTrigger(
				'Organization access required. Please join or create an organization.',
				'error'
			)
		);
		throw new Error('Organization access required');
	}
	return organization;
}

// Helper function to get organization-scoped exchange config
async function getOrganizationExchangeConfig(
	organizationId: string,
	exchangeName: string
) {
	return await db
		.select()
		.from(exchangeConfigs)
		.where(
			and(
				eq(exchangeConfigs.exchangeName, exchangeName),
				eq(exchangeConfigs.organizationId, organizationId),
				eq(exchangeConfigs.isActive, true)
			)
		)
		.get();
}

// Auto-generated Zod schemas from Drizzle tables
const userInsertSchema = createInsertSchema(users, {
	username: schema => schema.min(3, 'Username must be at least 3 characters'),
	email: schema => schema.email('Invalid email address'),
	passwordHash: schema =>
		schema.min(6, 'Password must be at least 6 characters'),
});

const savedWalletInsertSchema = createInsertSchema(savedWallets, {
	label: schema => schema.min(1, 'Label is required'),
	coin: schema => schema.min(1, 'Coin is required'),
	network: schema => schema.min(1, 'Network is required'),
	address: schema => schema.min(1, 'Address is required'),
	exchange: schema => schema.min(1, 'Exchange is required'),
});

const exchangeConfigInsertSchema = createInsertSchema(exchangeConfigs, {
	exchangeName: schema => schema.min(1, 'Exchange name is required'),
	apiKey: schema => schema.min(1, 'API key is required'),
	apiSecret: schema => schema.min(1, 'API secret is required'),
});

// Custom schemas for forms (not directly tied to database tables)
const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
	username: z.string().min(3, 'Username must be at least 3 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
});

const withdrawSchema = z.object({
	exchange: z.string().min(1, 'Exchange is required'),
	coin: z.string().min(1, 'Coin is required'),
	network: z.string().min(1, 'Network is required'),
	amount: z.coerce.number().positive('Amount must be positive'),
	address: z.string().min(1, 'Address is required'),
	memo: z.string().optional(),
});

// Wallet form schema (subset of savedWalletInsertSchema)
const walletSchema = savedWalletInsertSchema.pick({
	label: true,
	coin: true,
	network: true,
	address: true,
	exchange: true,
});

// Exchange config form schema (subset of exchangeConfigInsertSchema)
const exchangeConfigSchema = exchangeConfigInsertSchema.pick({
	exchangeName: true,
	apiKey: true,
	apiSecret: true,
	passphrase: true,
	testnet: true,
	isActive: true,
});

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Serve static files
app.use('/css/*', serveStatic({ root: './src/public' }));
app.use('/js/*', serveStatic({ root: './src/public' }));

// Organization setup page for development/demo purposes
app.get('/setup', async c => {
	// Create a default organization if none exists
	const existingOrg = await db.select().from(organizations).limit(1).get();

	if (!existingOrg) {
		// Create a system user first to own the demo organization
		const systemUser = await db.insert(users).values({
			username: 'system',
			email: 'system@transnet.local',
			passwordHash: hashPassword('system123'),
			isActive: false, // System user should not be able to login
		}).returning();

		const systemUserId = systemUser[0]?.id;
		if (!systemUserId) {
			throw new Error('Failed to create system user');
		}

		await db.insert(organizations).values({
			name: 'Demo Organization',
			slug: 'demo',
			ownerId: systemUserId,
			description: 'Default demo organization for TransNet',
		});
	}

	return c.html(
		<Layout title='TransNet - Setup Complete'>
			<div class='mx-auto max-w-2xl text-center'>
				<h1 class='mb-4 text-4xl font-bold'>Setup Complete!</h1>
				<p class='mb-6 text-lg'>
					Default organization "demo" has been created. You can now register
					users.
				</p>
				<div class='space-y-4'>
					<p class='text-sm text-gray-600'>
						Organization Slug:{' '}
						<code class='rounded bg-gray-100 px-2 py-1'>demo</code>
					</p>
					<div class='flex justify-center gap-4'>
						<a href='/login' class='btn btn-primary'>
							Login
						</a>
						<a href='/register' class='btn btn-outline'>
							Register
						</a>
					</div>
				</div>
			</div>
		</Layout>
	);
});

// Main page
app.get('/', optionalAuthMiddleware, async c => {
	const user = c.get('user');

	if (!user) {
		return c.html(
			<Layout title='TransNet - CEX Withdraw System'>
				<Welcome />
			</Layout>
		);
	}

	return c.html(
		<Layout title='TransNet - Dashboard' user={user}>
			<Dashboard />
		</Layout>
	);
});

// Authentication routes
app.get('/login', c => {
	const loginContent = <LoginForm />;

	// Check if this is an HTMX request
	const isHtmxRequest = c.req.header('HX-Request');
	if (isHtmxRequest) {
		return c.html(loginContent);
	}

	return c.html(<Layout title='TransNet - Login'>{loginContent}</Layout>);
});

app.get('/register', c => {
	const registerContent = <RegisterForm />;

	// Check if this is an HTMX request
	const isHtmxRequest = c.req.header('HX-Request');
	if (isHtmxRequest) {
		return c.html(registerContent);
	}

	return c.html(<Layout title='TransNet - Register'>{registerContent}</Layout>);
});

app.post('/login', async c => {
	const formData = await c.req.formData();
	const result = loginSchema.safeParse({
		username: formData.get('username'),
		password: formData.get('password'),
	});

	if (!result.success) {
		const errors = result.error.errors.reduce(
			(acc, e) => {
				const field = e.path[0] as string;
				acc[field] = e.message;
				return acc;
			},
			{} as { [key: string]: string }
		);

		return c.html(
			<LoginForm errors={errors} values={Object.fromEntries(formData)} />,
			400
		);
	}

	try {
		const { username, password } = result.data;
		const user = await authenticateUser(username, password);
		const token = generateToken(user.id);

		c.header(
			'Set-Cookie',
			`auth_token=${token}; HttpOnly; Path=/; Max-Age=604800`
		);
		c.header('HX-Redirect', '/');

		return c.text('Login successful');
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Login failed';
		return c.html(
			<LoginForm
				errors={{ general: errorMessage }}
				values={Object.fromEntries(formData)}
			/>,
			400
		);
	}
});

app.post('/register', async c => {
	const formData = await c.req.formData();
	const result = registerSchema.safeParse({
		username: formData.get('username'),
		email: formData.get('email'),
		password: formData.get('password'),
		// firstName: formData.get('firstName'),
		// lastName: formData.get('lastName'),
	});

	if (!result.success) {
		const errors = result.error.errors.reduce(
			(acc, e) => {
				const field = e.path[0] as string;
				acc[field] = e.message;
				return acc;
			},
			{} as { [key: string]: string }
		);

		return c.html(
			<RegisterForm errors={errors} values={Object.fromEntries(formData)} />,
			400
		);
	}

	try {
		const { username, email, password, firstName, lastName } = result.data;
		const user = await registerUser(
			username,
			email,
			password,
			undefined, // No organization on registration
			firstName,
			lastName
		);
		const token = generateToken(user.id);

		c.header(
			'Set-Cookie',
			`auth_token=${token}; HttpOnly; Path=/; Max-Age=604800`
		);
		c.header('HX-Redirect', '/');

		return c.text('Registration successful');
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Registration failed';
		return c.html(
			<RegisterForm
				errors={{ general: errorMessage }}
				values={Object.fromEntries(formData)}
			/>,
			400
		);
	}
});

app.post('/logout', c => {
	c.header('Set-Cookie', 'auth_token=; HttpOnly; Path=/; Max-Age=0');
	c.header('HX-Redirect', '/');
	return c.text('Logged out');
});

// Dashboard route
app.get('/dashboard', authMiddleware, async c => {
	const acceptsHtml = c.req.header('HX-Request');
	if (acceptsHtml) {
		return c.html(<Dashboard />);
	}
	return c.html(
		<Layout title='TransNet - Dashboard' user={c.get('user')}>
			<Dashboard />
		</Layout>
	);
});

// Balance routes
app.get('/balances', authMiddleware, async c => {
	try {
		const user = c.get('user');
		const organization = requireOrganization(c);
		const page = parseInt(c.req.query('page') || '1');
		const pageSize = 50; // Show 50 balances per page

		// Get active exchange configurations for this organization
		const configs = await db
			.select()
			.from(exchangeConfigs)
			.where(
				and(
					eq(exchangeConfigs.organizationId, organization.id),
					eq(exchangeConfigs.isActive, true)
				)
			);

		const allBalances: any[] = [];
		const exchangeErrors: Record<string, string> = {};

		// Fetch balances from all configured exchanges
		for (const config of configs) {
			try {
				if (!config.apiKey || !config.apiSecret || !config.isValid) continue;

				const client = ExchangeFactory.createClient(
					config.exchangeName,
					config.apiKey,
					config.apiSecret,
					config.passphrase || undefined
				);

				const balances = await client.getBalance();

				// Add exchange info and filter out zero balances
				const balancesWithExchange = balances
					.filter(balance => balance.total > 0)
					.map(balance => ({
						...balance,
						exchange: config.exchangeName,
					}));

				allBalances.push(...balancesWithExchange);
			} catch (error) {
				exchangeErrors[config.exchangeName] =
					error instanceof Error ? error.message : 'Unknown error';
			}
		}

		// Sort by total balance (highest first) and paginate
		const sortedBalances = allBalances.sort((a, b) => b.total - a.total);
		const totalBalances = sortedBalances.length;
		const totalPages = Math.ceil(totalBalances / pageSize);
		const startIndex = (page - 1) * pageSize;
		const paginatedBalances = sortedBalances.slice(
			startIndex,
			startIndex + pageSize
		);

		const balanceContent = (
			<BalanceView
				balances={paginatedBalances}
				exchangeErrors={exchangeErrors}
				page={page}
				totalPages={totalPages}
			/>
		);

		// Check if this is an HTMX request
		const isHtmxRequest = c.req.header('HX-Request');
		if (isHtmxRequest) {
			return c.html(balanceContent);
		}

		return c.html(
			<Layout title='TransNet - Balances' user={user}>
				{balanceContent}
			</Layout>
		);
	} catch (error) {
		const isHtmxRequest = c.req.header('HX-Request');
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to load balances';

		if (isHtmxRequest) {
			c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
			return c.text(errorMessage, 400);
		}

		return c.html(
			<Layout title='TransNet - Error'>
				<div class='alert alert-error'>
					<span>{errorMessage}</span>
				</div>
			</Layout>
		);
	}
});

// Withdraw routes
app.get('/withdraw', authMiddleware, async c => {
	try {
		const user = c.get('user');
		const organization = requireOrganization(c);

		// Get active exchange configurations for this organization
		const configs = await db
			.select()
			.from(exchangeConfigs)
			.where(
				and(
					eq(exchangeConfigs.organizationId, organization.id),
					eq(exchangeConfigs.isActive, true)
				)
			);

		const allCoins: any[] = [];
		const allBalances: any[] = [];
		const exchangeErrors: Record<string, string> = {};
		const availableExchanges: Array<{ name: string; displayName: string }> = [];

		// Create exchange display name mapping
		const exchangeDisplayNames: Record<string, string> = {
			mexc: 'MEXC',
			binance: 'Binance',
			kucoin: 'KuCoin',
			bitget: 'Bitget',
			bitmart: 'BitMart',
			gateio: 'Gate.io',
		};

		// Fetch data from all configured exchanges
		for (const config of configs) {
			try {
				if (!config.apiKey || !config.apiSecret) continue;

				// Add to available exchanges
				availableExchanges.push({
					name: config.exchangeName,
					displayName:
						exchangeDisplayNames[config.exchangeName] ||
						config.exchangeName.toUpperCase(),
				});

				const client = ExchangeFactory.createClient(
					config.exchangeName,
					config.apiKey,
					config.apiSecret,
					config.passphrase || undefined
				);

				// Get coins and balances in parallel
				const [coins, balances] = await Promise.all([
					client.getSupportedCoins(),
					client.getBalance(),
				]);

				// Add exchange info to each item
				const coinsWithExchange = coins.map(coin => ({
					...coin,
					exchange: config.exchangeName,
				}));
				const balancesWithExchange = balances.map(balance => ({
					...balance,
					exchange: config.exchangeName,
				}));

				allCoins.push(...coinsWithExchange);
				allBalances.push(...balancesWithExchange);
			} catch (error) {
				exchangeErrors[config.exchangeName] =
					error instanceof Error ? error.message : 'Unknown error';
			}
		}

		const userWallets = await db
			.select()
			.from(savedWallets)
			.where(eq(savedWallets.organizationId, organization.id));

		// Check if no exchanges are configured
		if (availableExchanges.length === 0) {
			const withdrawContent = (
				<div class='mx-auto max-w-2xl'>
					<div class='card bg-base-200 shadow-xl'>
						<div class='card-body text-center'>
							<h2 class='card-title justify-center'>No Exchanges Configured</h2>
							<p class='text-base-content/70 mb-4'>
								You need to configure at least one exchange before you can make
								withdrawals.
							</p>
							<div class='card-actions justify-center'>
								<a href='/settings' class='btn btn-primary'>
									Configure Exchange
								</a>
							</div>
						</div>
					</div>
				</div>
			);

			// Check if this is an HTMX request
			const isHtmxRequest = c.req.header('HX-Request');
			if (isHtmxRequest) {
				return c.html(withdrawContent);
			}

			return c.html(
				<Layout title='TransNet - Withdraw' user={user}>
					{withdrawContent}
				</Layout>
			);
		}

		const withdrawContent = (
			<WithdrawForm
				coins={allCoins}
				balances={allBalances}
				savedWallets={userWallets}
				exchangeErrors={exchangeErrors}
				availableExchanges={availableExchanges}
			/>
		);

		// Check if this is an HTMX request
		const isHtmxRequest = c.req.header('HX-Request');
		if (isHtmxRequest) {
			return c.html(withdrawContent);
		}

		return c.html(
			<Layout title='TransNet - Withdraw' user={user}>
				{withdrawContent}
			</Layout>
		);
	} catch (error) {
		const isHtmxRequest = c.req.header('HX-Request');
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to load withdraw page';

		if (isHtmxRequest) {
			c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
			return c.text(errorMessage, 400);
		}

		return c.html(
			<Layout title='TransNet - Error'>
				<div class='alert alert-error'>
					<span>{errorMessage}</span>
				</div>
			</Layout>
		);
	}
});

// API Routes for withdrawal functionality
app.get('/api/balance', authMiddleware, async c => {
	const coin = c.req.query('coin');
	const exchange = c.req.query('exchange');

	if (!coin || !exchange) {
		return c.html(
			<div class='form-control'>
				<label class='label'>
					<span class='label-text'>Available Balance</span>
				</label>
				<div class='input input-bordered bg-base-300'>
					<span id='balance-amount'>Select coin and exchange</span>
				</div>
			</div>
		);
	}

	try {
		const organization = requireOrganization(c);

		// Get exchange configuration for this organization
		const config = await getOrganizationExchangeConfig(
			organization.id,
			exchange
		);

		if (!config || !config.apiKey || !config.apiSecret) {
			return c.html(
				<div class='form-control'>
					<label class='label'>
						<span class='label-text'>Available Balance</span>
					</label>
					<div class='input input-bordered bg-base-300'>
						<span id='balance-amount'>Exchange not configured</span>
					</div>
				</div>
			);
		}

		const client = ExchangeFactory.createClient(
			config.exchangeName,
			config.apiKey,
			config.apiSecret,
			config.passphrase || undefined
		);

		const balances = await client.getBalance();
		const coinBalance = balances.find(b => b.coin === coin);

		return c.html(
			<div class='form-control'>
				<label class='label'>
					<span class='label-text'>Available Balance</span>
				</label>
				<div class='input input-bordered bg-base-300'>
					<span id='balance-amount'>
						{coinBalance?.free || 0} {coin}
					</span>
				</div>
			</div>
		);
	} catch (error) {
		return c.html(
			<div class='form-control'>
				<label class='label'>
					<span class='label-text'>Available Balance</span>
				</label>
				<div class='input input-bordered bg-base-300'>
					<span id='balance-amount'>Error loading balance</span>
				</div>
			</div>
		);
	}
});

app.get('/api/networks', authMiddleware, async c => {
	const coin = c.req.query('coin');
	const exchange = c.req.query('exchange');

	if (!coin || !exchange) {
		return c.json({ error: 'Missing coin or exchange parameter' }, 400);
	}

	try {
		const organization = requireOrganization(c);

		// Get exchange configuration for this organization
		const config = await getOrganizationExchangeConfig(
			organization.id,
			exchange
		);

		if (!config || !config.apiKey || !config.apiSecret) {
			return c.html(
				<select name='network' class='select select-bordered' required>
					<option value=''>Exchange not configured</option>
				</select>
			);
		}

		const client = ExchangeFactory.createClient(
			config.exchangeName,
			config.apiKey,
			config.apiSecret,
			config.passphrase || undefined
		);

		const networks = await client.getNetworks(coin);

		return c.html(
			<select name='network' class='select select-bordered' required>
				<option value=''>Select Network</option>
				{networks.map(network => (
					<option
						value={network.network}
						disabled={!network.withdrawEnabled || network.status !== 'active'}
						class={
							network.withdrawEnabled && network.status === 'active'
								? ''
								: 'text-gray-400'
						}
					>
						{network.network}
						{(!network.withdrawEnabled || network.status !== 'active') &&
							' (Disabled)'}
						{network.withdrawFee > 0 && ` - Fee: ${network.withdrawFee}`}
						{network.memo && ' (Requires memo)'}
					</option>
				))}
			</select>
		);
	} catch (error) {
		return c.html(
			<select name='network' class='select select-bordered' required>
				<option value=''>Error loading networks</option>
			</select>
		);
	}
});

app.post(
	'/api/withdraw',
	authMiddleware,
	zValidator('form', withdrawSchema, (result, c) => {
		if (!result.success) {
			const errors = result.error.errors
				.map(e => `${e.path.join('.')}: ${e.message}`)
				.join(', ');
			c.header(
				'HX-Trigger',
				createToastTrigger(`Validation error: ${errors}`, 'error')
			);
			return c.text(`Validation error: ${errors}`, 400);
		}
	}),
	async c => {
		try {
			const user = c.get('user');
			const organization = c.get('organization');
			const { exchange, coin, network, amount, address, memo } =
				c.req.valid('form');

			if (!organization) {
				throw new Error('Organization context required');
			}

			// Save to database with organization context
			const withdrawData = {
				organizationId: organization.id,
				initiatedBy: user.id,
				exchangeName: exchange,
				coin,
				network,
				amount,
				address,
				tag: memo || undefined,
				status: 'pending' as const,
				source: 'app' as const,
			};

			const result = await db
				.insert(withdrawHistory)
				.values(withdrawData)
				.returning();

			// Log activity
			await db.insert(activityLog).values({
				organizationId: organization.id,
				userId: user.id,
				action: 'withdrawal',
				entity: 'withdraw_history',
				entityId: result[0]!.id,
				details: JSON.stringify({ exchange, coin, network, amount, address }),
				ipAddress:
					c.req.header('CF-Connecting-IP') ||
					c.req.header('X-Forwarded-For') ||
					'unknown',
				userAgent: c.req.header('User-Agent') || 'unknown',
			});

			c.header(
				'HX-Trigger',
				createToastTrigger(
					`Withdrawal request submitted successfully! Transaction ID: ${result[0]!.id}`,
					'success'
				)
			);
			return c.text('');
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Withdrawal failed';
			c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
			return c.text(errorMessage, 400);
		}
	}
);

// Wallet management routes
app.get('/wallets', authMiddleware, async c => {
	const user = c.get('user');
	const userWallets = await db
		.select()
		.from(savedWallets)
		.where(eq(savedWallets.createdBy, user!.id))
		.orderBy(desc(savedWallets.createdAt));

	const walletContent = <WalletManager wallets={userWallets as any} />;

	// Check if this is an HTMX request
	const isHtmxRequest = c.req.header('HX-Request');
	if (isHtmxRequest) {
		return c.html(walletContent);
	}

	return c.html(
		<Layout title='TransNet - Wallets' user={user}>
			{walletContent}
		</Layout>
	);
});

app.get('/wallets/add', authMiddleware, async c => {
	try {
		const user = c.get('user');
		const organization = requireOrganization(c);

		// Get available exchanges for this organization
		const configs = await db
			.select()
			.from(exchangeConfigs)
			.where(
				and(
					eq(exchangeConfigs.organizationId, organization.id),
					eq(exchangeConfigs.isActive, true)
				)
			);

		const availableExchanges: Array<{ name: string; displayName: string }> = [];
		const exchangeDisplayNames: Record<string, string> = {
			mexc: 'MEXC',
			binance: 'Binance',
			kucoin: 'KuCoin',
			bitget: 'Bitget',
			bitmart: 'BitMart',
			gateio: 'Gate.io',
		};

		for (const config of configs) {
			if (config.apiKey && config.apiSecret && config.isValid) {
				availableExchanges.push({
					name: config.exchangeName,
					displayName:
						exchangeDisplayNames[config.exchangeName] ||
						config.exchangeName.toUpperCase(),
				});
			}
		}

		const addWalletContent = (
			<AddWalletForm availableExchanges={availableExchanges} />
		);

		// Check if this is an HTMX request
		const isHtmxRequest = c.req.header('HX-Request');
		if (isHtmxRequest) {
			return c.html(addWalletContent);
		}

		return c.html(
			<Layout title='TransNet - Add Wallet' user={user}>
				{addWalletContent}
			</Layout>
		);
	} catch (error) {
		const isHtmxRequest = c.req.header('HX-Request');
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to load add wallet form';

		if (isHtmxRequest) {
			c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
			return c.text(errorMessage, 400);
		}

		return c.html(
			<Layout title='TransNet - Error'>
				<div class='alert alert-error'>
					<span>{errorMessage}</span>
				</div>
			</Layout>
		);
	}
});

app.get('/api/wallet-coins', authMiddleware, async c => {
	const exchange = c.req.query('exchange');

	if (!exchange) {
		return c.html(
			<select name='coin' class='select select-bordered' required disabled>
				<option value=''>Select exchange first</option>
			</select>
		);
	}

	try {
		const organization = requireOrganization(c);

		// Get exchange configuration for this organization
		const config = await getOrganizationExchangeConfig(
			organization.id,
			exchange
		);

		if (!config || !config.apiKey || !config.apiSecret || !config.isValid) {
			return c.html(
				<select name='coin' class='select select-bordered' required disabled>
					<option value=''>Exchange not configured or invalid</option>
				</select>
			);
		}

		const client = ExchangeFactory.createClient(
			config.exchangeName,
			config.apiKey,
			config.apiSecret,
			config.passphrase || undefined
		);

		const coins = await client.getSupportedCoins();

		return c.html(
			<select
				name='coin'
				class='select select-bordered'
				required
				hx-get='/api/wallet-networks'
				hx-target='#network-selection-wallet'
				hx-trigger='change'
				hx-include="[name='exchange']"
			>
				<option value=''>Select Coin</option>
				{coins.map(coin => (
					<option value={coin.symbol}>
						{coin.symbol} - {coin.name}
					</option>
				))}
			</select>
		);
	} catch (error) {
		return c.html(
			<select name='coin' class='select select-bordered' required disabled>
				<option value=''>Error loading coins</option>
			</select>
		);
	}
});

app.get('/api/wallet-networks', authMiddleware, async c => {
	const coin = c.req.query('coin');
	const exchange = c.req.query('exchange');

	if (!coin || !exchange) {
		return c.html(
			<select name='network' class='select select-bordered' required disabled>
				<option value=''>Select coin first</option>
			</select>
		);
	}

	try {
		const organization = requireOrganization(c);

		// Get exchange configuration for this organization
		const config = await getOrganizationExchangeConfig(
			organization.id,
			exchange
		);

		if (!config || !config.apiKey || !config.apiSecret) {
			return c.html(
				<select name='network' class='select select-bordered' required disabled>
					<option value=''>Exchange not configured</option>
				</select>
			);
		}

		const client = ExchangeFactory.createClient(
			config.exchangeName,
			config.apiKey,
			config.apiSecret,
			config.passphrase || undefined
		);

		const networks = await client.getNetworks(coin);

		return c.html(
			<select name='network' class='select select-bordered' required>
				<option value=''>Select Network</option>
				{networks.map(network => (
					<option
						value={network.network}
						disabled={!network.withdrawEnabled || network.status !== 'active'}
						class={
							network.withdrawEnabled && network.status === 'active'
								? ''
								: 'text-gray-400'
						}
					>
						{network.network}
						{(!network.withdrawEnabled || network.status !== 'active') &&
							' (Disabled)'}
						{network.withdrawFee > 0 && ` - Fee: ${network.withdrawFee}`}
						{network.memo && ' (Requires memo)'}
					</option>
				))}
			</select>
		);
	} catch (error) {
		return c.html(
			<select name='network' class='select select-bordered' required disabled>
				<option value=''>Error loading networks</option>
			</select>
		);
	}
});

app.get('/api/wallet-address', authMiddleware, async c => {
	const walletId = c.req.query('wallet');

	if (!walletId) {
		return c.html(
			<input
				id='address-input'
				type='text'
				name='address'
				placeholder='Withdrawal address'
				class='input input-bordered'
				required
			/>
		);
	}

	try {
		const user = c.get('user');
		const wallet = await db
			.select()
			.from(savedWallets)
			.where(eq(savedWallets.id, walletId))
			.get();

		if (!wallet || wallet.createdBy !== user!.id) {
			return c.html(
				<input
					id='address-input'
					type='text'
					name='address'
					placeholder='Withdrawal address'
					class='input input-bordered'
					required
				/>
			);
		}

		return c.html(
			<input
				id='address-input'
				type='text'
				name='address'
				value={wallet.address}
				placeholder='Withdrawal address'
				class='input input-bordered'
				required
			/>
		);
	} catch (error) {
		return c.html(
			<input
				id='address-input'
				type='text'
				name='address'
				placeholder='Withdrawal address'
				class='input input-bordered'
				required
			/>
		);
	}
});

app.post('/api/wallets', authMiddleware, async c => {
	try {
		const user = c.get('user');
		const organization = requireOrganization(c);
		const body = await c.req.parseBody();

		const { label, coin, network, address, exchange } = body;

		if (!label || !coin || !network || !address || !exchange) {
			throw new Error('All fields are required');
		}

		const walletData = {
			organizationId: organization.id,
			createdBy: user!.id,
			label: label as string,
			coin: coin as string,
			network: network as string,
			address: address as string,
			exchange: exchange as string,
		};

		await db.insert(savedWallets).values(walletData);

		c.header(
			'HX-Trigger',
			createToastTrigger('Wallet saved successfully!', 'success')
		);
		c.header('HX-Redirect', '/wallets');
		return c.text('');
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to save wallet';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text('', 400);
	}
});

app.delete('/api/wallets/:id', authMiddleware, async c => {
	try {
		const user = c.get('user');
		const walletId = c.req.param('id');

		await db
			.delete(savedWallets)
			.where(
				and(eq(savedWallets.id, walletId), eq(savedWallets.createdBy, user!.id))
			);

		c.header(
			'HX-Trigger',
			createToastTrigger('Wallet deleted successfully!', 'success')
		);
		return c.text('');
	} catch (error) {
		c.header(
			'HX-Trigger',
			createToastTrigger('Failed to delete wallet', 'error')
		);
		return c.text('', 400);
	}
});

// Transaction history
app.get('/history', authMiddleware, async c => {
	const user = c.get('user');
	const transactions = await db
		.select()
		.from(withdrawHistory)
		.where(eq(withdrawHistory.initiatedBy, user!.id))
		.orderBy(desc(withdrawHistory.createdAt))
		.limit(50);

	const historyContent = (
		<TransactionHistory transactions={transactions as any} />
	);

	// Check if this is an HTMX request
	const isHtmxRequest = c.req.header('HX-Request');
	if (isHtmxRequest) {
		return c.html(historyContent);
	}

	return c.html(
		<Layout title='TransNet - History' user={user}>
			{historyContent}
		</Layout>
	);
});

app.get('/api/transaction/:id', authMiddleware, async c => {
	const user = c.get('user');
	const txId = c.req.param('id');

	const transaction = await db
		.select()
		.from(withdrawHistory)
		.where(
			eq(withdrawHistory.id, txId) && eq(withdrawHistory.initiatedBy, user!.id)
		)
		.get();

	if (!transaction) {
		return c.html(
			<div class='alert alert-error'>
				<span>Transaction not found</span>
			</div>,
			404
		);
	}

	return c.html(<TransactionDetails transaction={transaction as any} />);
});

// Organization Management Routes
app.get('/organizations', authMiddleware, async c => {
	const user = c.get('user');
	const { getUserOrganizations } = await import('../auth/utils');

	const userOrgs = await getUserOrganizations(user!.id);
	const currentOrg = c.get('organization');

	const organizationsContent = (
		<OrganizationManager
			user={user!}
			organizations={userOrgs}
			currentOrganization={currentOrg}
		/>
	);

	const isHtmxRequest = c.req.header('HX-Request');
	if (isHtmxRequest) {
		return c.html(organizationsContent);
	}

	return c.html(
		<Layout title='TransNet - Organizations' user={user}>
			{organizationsContent}
		</Layout>
	);
});

// Create organization API
app.post('/api/organizations/create', authMiddleware, async c => {
	const formData = await c.req.formData();
	const user = c.get('user');

	const orgSchema = z.object({
		name: z.string().min(1, 'Name is required'),
		slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
		description: z.string().optional(),
	});

	const result = orgSchema.safeParse({
		name: formData.get('name'),
		slug: formData.get('slug'),
		description: formData.get('description'),
	});

	if (!result.success) {
		const errorMessage = result.error.errors[0]?.message || 'Validation failed';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text(errorMessage, 400);
	}

	try {
		const { createOrganization } = await import('../auth/utils');
		const { organizationMemberships } = await import('../database');

		const organization = await createOrganization(
			result.data.name,
			result.data.slug,
			user!.id,
			result.data.description
		);

		// Create owner membership
		await db.insert(organizationMemberships).values({
			userId: user!.id,
			organizationId: organization.id,
			role: 'owner',
			status: 'active',
		});

		// Set as current organization
		await db.update(users)
			.set({ currentOrganizationId: organization.id })
			.where(eq(users.id, user!.id));

		c.header('HX-Trigger', createToastTrigger('Organization created successfully', 'success'));
		c.header('HX-Redirect', '/dashboard');
		return c.text('Organization created');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text(errorMessage, 400);
	}
});

// Switch organization API
app.post('/api/organizations/switch/:id', authMiddleware, async c => {
	const user = c.get('user');
	const organizationId = c.req.param('id');

	try {
		const { switchUserOrganization } = await import('../auth/utils');
		await switchUserOrganization(user!.id, organizationId);

		c.header('HX-Trigger', createToastTrigger('Switched organization successfully', 'success'));
		c.header('HX-Redirect', '/dashboard');
		return c.text('Organization switched');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to switch organization';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text(errorMessage, 400);
	}
});

// Join organization by invitation code
app.post('/api/organizations/join', authMiddleware, async c => {
	const formData = await c.req.formData();
	const user = c.get('user');
	const invitationCode = formData.get('invitationCode') as string;

	if (!invitationCode) {
		c.header('HX-Trigger', createToastTrigger('Invitation code is required', 'error'));
		return c.text('Invitation code is required', 400);
	}

	try {
		const { organizationInvitations, organizationMemberships } = await import('../database');

		// Find the invitation
		const invitation = await db
			.select()
			.from(organizationInvitations)
			.where(
				and(
					eq(organizationInvitations.token, invitationCode),
					eq(organizationInvitations.status, 'pending')
				)
			)
			.get();

		if (!invitation) {
			c.header('HX-Trigger', createToastTrigger('Invalid or expired invitation code', 'error'));
			return c.text('Invalid or expired invitation code', 400);
		}

		// Check if invitation is expired
		if (new Date(invitation.expiresAt) < new Date()) {
			await db
				.update(organizationInvitations)
				.set({ status: 'expired' })
				.where(eq(organizationInvitations.id, invitation.id));

			c.header('HX-Trigger', createToastTrigger('Invitation has expired', 'error'));
			return c.text('Invitation has expired', 400);
		}

		// Check if user is already a member
		const existingMembership = await db
			.select()
			.from(organizationMemberships)
			.where(
				and(
					eq(organizationMemberships.userId, user!.id),
					eq(organizationMemberships.organizationId, invitation.organizationId)
				)
			)
			.get();

		if (existingMembership) {
			c.header('HX-Trigger', createToastTrigger('You are already a member of this organization', 'error'));
			return c.text('Already a member', 400);
		}

		// Create membership
		await db.insert(organizationMemberships).values({
			userId: user!.id,
			organizationId: invitation.organizationId,
			role: invitation.role,
			status: 'active',
		});

		// Update invitation
		await db
			.update(organizationInvitations)
			.set({
				status: 'accepted',
				acceptedAt: new Date(),
				acceptedBy: user!.id,
			})
			.where(eq(organizationInvitations.id, invitation.id));

		// Set as current organization if user doesn't have one
		if (!user!.currentOrganizationId) {
			await db
				.update(users)
				.set({ currentOrganizationId: invitation.organizationId })
				.where(eq(users.id, user!.id));
		}

		c.header('HX-Trigger', createToastTrigger('Successfully joined organization', 'success'));
		c.header('HX-Redirect', '/dashboard');
		return c.text('Joined organization');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to join organization';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text(errorMessage, 400);
	}
});

// Organization settings page
app.get('/organizations/:slug/settings', authMiddleware, async c => {
	const user = c.get('user');
	const slug = c.req.param('slug');

	const organization = await db
		.select()
		.from(organizations)
		.where(eq(organizations.slug, slug))
		.get();

	if (!organization) {
		return c.html(
			<div class='alert alert-error'>
				<span>Organization not found</span>
			</div>,
			404
		);
	}

	// Check if user is owner
	const { organizationMemberships } = await import('../database');
	const membership = await db
		.select()
		.from(organizationMemberships)
		.where(
			and(
				eq(organizationMemberships.userId, user!.id),
				eq(organizationMemberships.organizationId, organization.id)
			)
		)
		.get();

	if (!membership || membership.role !== 'owner') {
		c.header('HX-Trigger', createToastTrigger('Only organization owners can access settings', 'error'));
		c.header('HX-Redirect', '/organizations');
		return c.text('Unauthorized', 403);
	}

	// Get members
	const members = await db
		.select({
			user: users,
			membership: organizationMemberships,
		})
		.from(organizationMemberships)
		.innerJoin(users, eq(organizationMemberships.userId, users.id))
		.where(eq(organizationMemberships.organizationId, organization.id));

	// Get invitations
	const { organizationInvitations } = await import('../database');
	const invitations = await db
		.select()
		.from(organizationInvitations)
		.where(
			and(
				eq(organizationInvitations.organizationId, organization.id),
				eq(organizationInvitations.status, 'pending')
			)
		);

	const settingsContent = (
		<OrganizationSettings
			organization={organization}
			isOwner={true}
			members={members}
			invitations={invitations}
		/>
	);

	const isHtmxRequest = c.req.header('HX-Request');
	if (isHtmxRequest) {
		return c.html(settingsContent);
	}

	return c.html(
		<Layout title={`TransNet - ${organization.name} Settings`} user={user}>
			{settingsContent}
		</Layout>
	);
});

// Create invitation
app.post('/api/organizations/:id/invitations', authMiddleware, async c => {
	const user = c.get('user');
	const organizationId = c.req.param('id');
	const formData = await c.req.formData();

	const inviteSchema = z.object({
		email: z.string().email('Invalid email address'),
		role: z.enum(['member', 'admin']),
	});

	const result = inviteSchema.safeParse({
		email: formData.get('email'),
		role: formData.get('role') || 'member',
	});

	if (!result.success) {
		const errorMessage = result.error.errors[0]?.message || 'Validation failed';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text(errorMessage, 400);
	}

	try {
		// Verify user is owner
		const { organizationMemberships } = await import('../database');
		const membership = await db
			.select()
			.from(organizationMemberships)
			.where(
				and(
					eq(organizationMemberships.userId, user!.id),
					eq(organizationMemberships.organizationId, organizationId),
					eq(organizationMemberships.role, 'owner')
				)
			)
			.get();

		if (!membership) {
			c.header('HX-Trigger', createToastTrigger('Only owners can invite members', 'error'));
			return c.text('Unauthorized', 403);
		}

		// Generate invitation code
		const { organizationInvitations } = await import('../database');
		const { createId } = await import('@paralleldrive/cuid2');
		const token = createId();

		// Create invitation (expires in 7 days)
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		await db.insert(organizationInvitations).values({
			organizationId,
			invitedBy: user!.id,
			email: result.data.email,
			role: result.data.role,
			token,
			status: 'pending',
			expiresAt,
		});

		// Get organization for redirect
		const organization = await db
			.select()
			.from(organizations)
			.where(eq(organizations.id, organizationId))
			.get();

		c.header('HX-Trigger', createToastTrigger('Invitation created successfully', 'success'));
		c.header('HX-Redirect', `/organizations/${organization!.slug}/settings`);
		return c.text('Invitation created');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to create invitation';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text(errorMessage, 400);
	}
});

// Cancel invitation
app.delete('/api/organizations/:orgId/invitations/:invId', authMiddleware, async c => {
	const user = c.get('user');
	const organizationId = c.req.param('orgId');
	const invitationId = c.req.param('invId');

	try {
		// Verify user is owner
		const { organizationMemberships, organizationInvitations } = await import('../database');
		const membership = await db
			.select()
			.from(organizationMemberships)
			.where(
				and(
					eq(organizationMemberships.userId, user!.id),
					eq(organizationMemberships.organizationId, organizationId),
					eq(organizationMemberships.role, 'owner')
				)
			)
			.get();

		if (!membership) {
			c.header('HX-Trigger', createToastTrigger('Only owners can manage invitations', 'error'));
			return c.text('Unauthorized', 403);
		}

		// Cancel invitation
		await db
			.update(organizationInvitations)
			.set({ status: 'cancelled' })
			.where(
				and(
					eq(organizationInvitations.id, invitationId),
					eq(organizationInvitations.organizationId, organizationId)
				)
			);

		// Get organization for redirect
		const organization = await db
			.select()
			.from(organizations)
			.where(eq(organizations.id, organizationId))
			.get();

		c.header('HX-Trigger', createToastTrigger('Invitation cancelled', 'success'));
		c.header('HX-Redirect', `/organizations/${organization!.slug}/settings`);
		return c.text('Invitation cancelled');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to cancel invitation';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text(errorMessage, 400);
	}
});

// Remove member
app.delete('/api/organizations/:orgId/members/:memberId', authMiddleware, async c => {
	const user = c.get('user');
	const organizationId = c.req.param('orgId');
	const membershipId = c.req.param('memberId');

	try {
		// Verify user is owner
		const { organizationMemberships } = await import('../database');
		const ownerMembership = await db
			.select()
			.from(organizationMemberships)
			.where(
				and(
					eq(organizationMemberships.userId, user!.id),
					eq(organizationMemberships.organizationId, organizationId),
					eq(organizationMemberships.role, 'owner')
				)
			)
			.get();

		if (!ownerMembership) {
			c.header('HX-Trigger', createToastTrigger('Only owners can remove members', 'error'));
			return c.text('Unauthorized', 403);
		}

		// Get membership to remove
		const membershipToRemove = await db
			.select()
			.from(organizationMemberships)
			.where(eq(organizationMemberships.id, membershipId))
			.get();

		if (!membershipToRemove || membershipToRemove.role === 'owner') {
			c.header('HX-Trigger', createToastTrigger('Cannot remove this member', 'error'));
			return c.text('Cannot remove member', 400);
		}

		// Remove membership
		await db
			.delete(organizationMemberships)
			.where(eq(organizationMemberships.id, membershipId));

		// If removed user has this as current org, clear it
		await db
			.update(users)
			.set({ currentOrganizationId: null })
			.where(
				and(
					eq(users.id, membershipToRemove.userId),
					eq(users.currentOrganizationId, organizationId)
				)
			);

		// Get organization for redirect
		const organization = await db
			.select()
			.from(organizations)
			.where(eq(organizations.id, organizationId))
			.get();

		c.header('HX-Trigger', createToastTrigger('Member removed successfully', 'success'));
		c.header('HX-Redirect', `/organizations/${organization!.slug}/settings`);
		return c.text('Member removed');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
		c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
		return c.text(errorMessage, 400);
	}
});

// Exchange Settings Routes
app.get('/settings', authMiddleware, async c => {
	const user = c.get('user');
	const configs = await db
		.select()
		.from(exchangeConfigs)
		.orderBy(desc(exchangeConfigs.updatedAt));

	const settingsContent = <ExchangeSettings configs={configs as any} />;

	// Check if this is an HTMX request
	const isHtmxRequest = c.req.header('HX-Request');
	if (isHtmxRequest) {
		return c.html(settingsContent);
	}

	return c.html(
		<Layout title='TransNet - Settings' user={user}>
			{settingsContent}
		</Layout>
	);
});

app.get('/settings/exchanges/add', authMiddleware, async c => {
	const user = c.get('user');
	const exchange = c.req.query('exchange');

	const exchangeFormContent = <ExchangeForm exchange={exchange} />;

	// Check if this is an HTMX request
	const isHtmxRequest = c.req.header('HX-Request');
	if (isHtmxRequest) {
		return c.html(exchangeFormContent);
	}

	return c.html(
		<Layout title='TransNet - Add Exchange' user={user}>
			{exchangeFormContent}
		</Layout>
	);
});

app.get('/settings/exchanges/:id', authMiddleware, async c => {
	try {
		const user = c.get('user');
		const organization = requireOrganization(c);
		const configId = c.req.param('id');
		const exchange = c.req.query('exchange');

		if (configId === 'new') {
			const exchangeFormContent = <ExchangeForm exchange={exchange} />;

			// Check if this is an HTMX request
			const isHtmxRequest = c.req.header('HX-Request');
			if (isHtmxRequest) {
				return c.html(exchangeFormContent);
			}

			return c.html(
				<Layout title='TransNet - Add Exchange' user={user}>
					{exchangeFormContent}
				</Layout>
			);
		}

		// Get exchange configuration for this organization
		const config = await db
			.select()
			.from(exchangeConfigs)
			.where(
				and(
					eq(exchangeConfigs.id, configId),
					eq(exchangeConfigs.organizationId, organization.id)
				)
			)
			.get();

		if (!config) {
			const errorContent = (
				<div class='alert alert-error'>
					<span>Exchange configuration not found</span>
				</div>
			);

			const isHtmxRequest = c.req.header('HX-Request');
			if (isHtmxRequest) {
				return c.html(errorContent, 404);
			}

			return c.html(
				<Layout title='TransNet - Error' user={user}>
					{errorContent}
				</Layout>,
				404
			);
		}

		const exchangeFormContent = <ExchangeForm config={config as any} />;

		// Check if this is an HTMX request
		const isHtmxRequest = c.req.header('HX-Request');
		if (isHtmxRequest) {
			return c.html(exchangeFormContent);
		}

		return c.html(
			<Layout title='TransNet - Edit Exchange' user={user}>
				{exchangeFormContent}
			</Layout>
		);
	} catch (error) {
		const isHtmxRequest = c.req.header('HX-Request');
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Failed to load exchange configuration';

		if (isHtmxRequest) {
			c.header('HX-Trigger', createToastTrigger(errorMessage, 'error'));
			return c.text(errorMessage, 400);
		}

		return c.html(
			<Layout title='TransNet - Error'>
				<div class='alert alert-error'>
					<span>{errorMessage}</span>
				</div>
			</Layout>
		);
	}
});

// API Routes for Exchange Management
app.post('/api/exchanges', authMiddleware, async c => {
	try {
		const user = c.get('user');
		const organization = c.get('organization');

		if (!organization) {
			throw new Error('Organization context required');
		}

		const body = await c.req.parseBody();
		const { exchangeName, apiKey, apiSecret, passphrase, testnet, isActive } =
			body;

		if (!exchangeName || !apiKey || !apiSecret) {
			throw new Error('Exchange name, API key, and API secret are required');
		}

		// Test the connection and mark as valid
		const validationResult = { isValid: false, error: null as string | null };
		try {
			const client = ExchangeFactory.createClient(
				exchangeName as string,
				apiKey as string,
				apiSecret as string,
				(passphrase as string) || undefined
			);
			const isConnected = await client.testConnection();

			if (!isConnected) {
				throw new Error(
					'Failed to connect to exchange with provided credentials'
				);
			}
			validationResult.isValid = true;
		} catch (error) {
			validationResult.error =
				error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Invalid credentials: ${validationResult.error}`);
		}

		const configData = {
			organizationId: organization.id,
			createdBy: user.id,
			exchangeName: exchangeName as string,
			apiKey: apiKey as string,
			apiSecret: apiSecret as string,
			passphrase: (passphrase as string) || undefined,
			testnet: testnet === 'on',
			isActive: isActive !== undefined ? isActive === 'on' : true,
			isValid: validationResult.isValid,
			lastValidationAt: new Date(),
			validationError: validationResult.error,
		};

		await db.insert(exchangeConfigs).values(configData);

		return c.html(
			<div class='alert alert-success'>
				<span>Exchange configuration saved successfully!</span>
				<div class='mt-2'>
					<button
						class='btn btn-sm'
						onclick="document.getElementById('modal').close(); window.location.reload()"
					>
						Close
					</button>
				</div>
			</div>
		);
	} catch (error) {
		return c.html(
			<div class='alert alert-error'>
				<span>
					{error instanceof Error
						? error.message
						: 'Failed to save configuration'}
				</span>
			</div>,
			400
		);
	}
});

app.post('/api/exchanges/:id', authMiddleware, async c => {
	try {
		const configId = c.req.param('id');
		const body = await c.req.parseBody();
		const { exchangeName, apiKey, apiSecret, passphrase, testnet, isActive } =
			body;

		if (!exchangeName || !apiKey || !apiSecret) {
			throw new Error('Exchange name, API key, and API secret are required');
		}

		// Test the connection and mark as valid
		const validationResult = { isValid: false, error: null as string | null };
		try {
			const client = ExchangeFactory.createClient(
				exchangeName as string,
				apiKey as string,
				apiSecret as string,
				(passphrase as string) || undefined
			);
			const isConnected = await client.testConnection();

			if (!isConnected) {
				throw new Error(
					'Failed to connect to exchange with provided credentials'
				);
			}
			validationResult.isValid = true;
		} catch (error) {
			validationResult.error =
				error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Invalid credentials: ${validationResult.error}`);
		}

		const updateData = {
			exchangeName: exchangeName as string,
			apiKey: apiKey as string,
			apiSecret: apiSecret as string,
			passphrase: (passphrase as string) || undefined,
			testnet: testnet === 'on',
			isActive: isActive !== undefined ? isActive === 'on' : true,
			isValid: validationResult.isValid,
			lastValidationAt: new Date(),
			validationError: validationResult.error,
			updatedAt: new Date(),
		};

		await db
			.update(exchangeConfigs)
			.set(updateData)
			.where(eq(exchangeConfigs.id, configId));

		return c.html(
			<div class='alert alert-success'>
				<span>Exchange configuration updated successfully!</span>
				<div class='mt-2'>
					<button
						class='btn btn-sm'
						onclick="document.getElementById('modal').close(); window.location.reload()"
					>
						Close
					</button>
				</div>
			</div>
		);
	} catch (error) {
		return c.html(
			<div class='alert alert-error'>
				<span>
					{error instanceof Error
						? error.message
						: 'Failed to update configuration'}
				</span>
			</div>,
			400
		);
	}
});

app.delete('/api/exchanges/:id', authMiddleware, async c => {
	try {
		const configId = c.req.param('id');

		await db.delete(exchangeConfigs).where(eq(exchangeConfigs.id, configId));

		return c.text('');
	} catch (error) {
		return c.html(
			<div class='alert alert-error'>
				<span>Failed to delete exchange configuration</span>
			</div>,
			400
		);
	}
});

app.post('/api/exchanges/:id/test', authMiddleware, async c => {
	const configId = c.req.param('id');

	try {
		const config = await db
			.select()
			.from(exchangeConfigs)
			.where(eq(exchangeConfigs.id, configId))
			.get();

		if (!config) {
			throw new Error('Exchange configuration not found');
		}

		const client = ExchangeFactory.createClient(
			config.exchangeName,
			config.apiKey!,
			config.apiSecret!,
			config.passphrase || undefined
		);

		const isConnected = await client.testConnection();

		// Update validation status in database
		await db
			.update(exchangeConfigs)
			.set({
				isValid: isConnected,
				lastValidationAt: new Date(),
				validationError: isConnected ? null : 'Connection test failed',
			})
			.where(eq(exchangeConfigs.id, configId));

		if (isConnected) {
			return c.html(
				<div class='alert alert-success'>
					<span>✅ Connection successful! Validation status updated.</span>
				</div>
			);
		} else {
			return c.html(
				<div class='alert alert-error'>
					<span>❌ Connection failed. Validation status updated.</span>
				</div>
			);
		}
	} catch (error) {
		// Update validation status to false on error
		await db
			.update(exchangeConfigs)
			.set({
				isValid: false,
				lastValidationAt: new Date(),
				validationError:
					error instanceof Error ? error.message : 'Unknown error',
			})
			.where(eq(exchangeConfigs.id, configId));

		return c.html(
			<div class='alert alert-error'>
				<span>
					❌ Error: {error instanceof Error ? error.message : 'Unknown error'}
				</span>
			</div>
		);
	}
});

// Set up periodic cleanup tasks
import { setupCleanupTasks } from '../utils/cleanup';
setupCleanupTasks();

export default {
	port: process.env.PORT || 3000,
	fetch: app.fetch,
};

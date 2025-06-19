declare global {
  interface Window {
    htmx2: any;
  }
}

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastTrigger {
  showToast: ToastData;
}

// Configure HTMX to accept all status codes for swapping
window.htmx2.config.responseHandling = [
	{code:".*", swap: true}
];

// Client-side event listener for toast notifications
document.addEventListener('htmx:responseError', function(evt: any) {
	const response = evt.detail.xhr.response;
	try {
		const errorData = JSON.parse(response);
		if (errorData.message) {
			showToast(errorData.message, 'error');
		}
	} catch (e) {
		showToast('An error occurred', 'error');
	}
});

// Toast notification function
function showToast(message: string, type: ToastType, duration: number = 5000): void {
	const container = document.getElementById('toast-container');
	if (!container) return;
	
	const toast = document.createElement('div');
	toast.className = `alert alert-${type} shadow-lg`;
	toast.innerHTML = `
		<div class="flex items-center">
			${getToastIcon(type)}
			<span>${message}</span>
		</div>
	`;
	
	// Hyperscript for animations
	toast.setAttribute('_', `
		on load 
			add .animate-pulse 
			wait ${duration}ms 
			then add .opacity-0 .translate-x-full 
			then wait 300ms 
			then remove me
	`);
	
	container.appendChild(toast);
}

function getToastIcon(type: ToastType): string {
	const icons: Record<ToastType, string> = {
		success: '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
		error: '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
		warning: '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
		info: '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
	};
	return icons[type] || icons.info;
}

// Handle server-side toast triggers
document.addEventListener('htmx:afterRequest', function(evt: any) {
	const triggerHeader = evt.detail.xhr.getResponseHeader('HX-Trigger');
	if (triggerHeader) {
		try {
			const triggers: ToastTrigger = JSON.parse(triggerHeader);
			if (triggers.showToast) {
				const { message, type, duration } = triggers.showToast;
				showToast(message, type, duration);
			}
		} catch (e) {
			// Ignore parsing errors
		}
	}
});
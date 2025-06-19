interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function Toast({ message, type, duration = 5000 }: ToastProps) {
  const alertClass = {
    success: 'alert-success',
    error: 'alert-error', 
    warning: 'alert-warning',
    info: 'alert-info'
  }[type];

  return (
    <div 
      class={`alert ${alertClass} shadow-lg`}
      _={`
        on load 
          add .animate-pulse 
          wait ${duration}ms 
          then add .opacity-0 .translate-x-full 
          then wait 300ms 
          then remove me
      `}
    >
      <div class="flex items-center">
        {type === 'success' && (
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {type === 'error' && (
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {type === 'warning' && (
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )}
        {type === 'info' && (
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}

export function ToastContainer() {
  return (
    <div 
      id="toast-container" 
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
    >
      {/* Toasts will be inserted here */}
    </div>
  );
}

// Server-side helper for triggering toasts
export function createToastTrigger(message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 5000) {
  return JSON.stringify({
    showToast: {
      message,
      type,
      duration
    }
  });
}
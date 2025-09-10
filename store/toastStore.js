import { create } from "zustand";

export const useToastStore = create((set, get) => ({
  toasts: [],
  
  showToast: ({ message, type = "info", duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  },
  
  clearAllToasts: () => {
    set({ toasts: [] });
  },
  
  // Convenience methods
  showSuccess: (message, duration) => {
    return get().showToast({ message, type: "success", duration });
  },
  
  showError: (message, duration) => {
    return get().showToast({ message, type: "error", duration });
  },
  
  showWarning: (message, duration) => {
    return get().showToast({ message, type: "warning", duration });
  },
  
  showInfo: (message, duration) => {
    return get().showToast({ message, type: "info", duration });
  },
}));
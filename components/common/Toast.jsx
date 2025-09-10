"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 border-green-200",
          text: "text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-500",
        };
      case "error":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-800", 
          icon: XCircle,
          iconColor: "text-red-500",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          text: "text-yellow-800",
          icon: AlertTriangle,
          iconColor: "text-yellow-500",
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50 border-blue-200",
          text: "text-blue-800",
          icon: Info,
          iconColor: "text-blue-500",
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          const IconComponent = styles.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              className={`${styles.bg} border rounded-lg shadow-lg p-4 pointer-events-auto`}
            >
              <div className="flex items-start space-x-3">
                <IconComponent className={`h-5 w-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${styles.text} break-words`}>
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Progress bar for auto-dismiss */}
              {toast.duration > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-current rounded-bl-lg"
                  style={{ 
                    color: styles.iconColor.includes('green') ? '#10b981' :
                           styles.iconColor.includes('red') ? '#ef4444' :
                           styles.iconColor.includes('yellow') ? '#f59e0b' : '#3b82f6'
                  }}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: toast.duration / 1000, ease: "linear" }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
import React from 'react';
import { Toast } from '../../contexts/AuthContext';

interface ToastProps {
  toast: Toast;
}

const ToastComponent: React.FC<ToastProps> = ({ toast }) => {
  const typeClasses = {
    success: 'bg-emerald-500',
    info: 'bg-sky-500',
    error: 'bg-red-500',
  };

  const icons = {
      success: '✅',
      info: 'ℹ️',
      error: '❌'
  }

  return (
    <div className="bg-zinc-800 rounded-lg shadow-2xl flex overflow-hidden transform transition-all duration-300 animate-slide-in">
       <style>{`
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}</style>
      <div className={`w-2 ${typeClasses[toast.type]}`}></div>
      <div className="p-3 flex items-center space-x-3">
        <span className="text-lg">{icons[toast.type]}</span>
        <p className="text-sm font-medium text-zinc-200">{toast.message}</p>
      </div>
    </div>
  );
};


interface ToastContainerProps {
  toasts: Toast[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed top-5 right-5 z-50 space-y-3 w-auto">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

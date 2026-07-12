import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Info, HelpCircle } from 'lucide-react';

const AlertContext = createContext(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    resolve: null
  });

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    resolve: null
  });

  const [toasts, setToasts] = useState([]);

  // Toast Functionality
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Alert Functionality
  const alert = useCallback((title, message, type = 'info') => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        title,
        message,
        type,
        resolve
      });
    });
  }, []);

  const closeAlert = () => {
    if (alertState.resolve) {
      alertState.resolve();
    }
    setAlertState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  // Confirm Functionality
  const confirm = useCallback((title, message, type = 'warning') => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        type,
        resolve
      });
    });
  }, []);

  const handleConfirmResponse = (value) => {
    if (confirmState.resolve) {
      confirmState.resolve(value);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  // Icon mapping
  const getIcon = (type) => {
    const iconSize = "w-6 h-6";
    switch (type) {
      case 'success':
        return <CheckCircle2 className={`${iconSize} text-emerald-400`} />;
      case 'error':
        return <XCircle className={`${iconSize} text-rose-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconSize} text-amber-500`} />;
      case 'info':
      default:
        return <Info className={`${iconSize} text-indigo-400`} />;
    }
  };

  // Glow classes mapping
  const getGlowClass = (type) => {
    switch (type) {
      case 'success':
        return 'shadow-[0_0_40px_rgba(16,185,129,0.15)] border-emerald-500/25';
      case 'error':
        return 'shadow-[0_0_40px_rgba(239,68,68,0.15)] border-rose-500/25';
      case 'warning':
        return 'shadow-[0_0_40px_rgba(245,158,11,0.15)] border-amber-500/25';
      case 'info':
      default:
        return 'shadow-[0_0_40px_rgba(99,102,241,0.15)] border-indigo-500/25';
    }
  };

  // Button style helpers
  const getButtonClass = (type) => {
    const common = "px-5 py-2 text-sm font-bold rounded-xl transition duration-200";
    switch (type) {
      case 'success':
        return `${common} bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-450 text-slate-950 shadow-[0_4px_15px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.35)]`;
      case 'error':
        return `${common} bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-455 hover:to-red-550 text-white shadow-[0_4px_15px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.35)]`;
      case 'warning':
        return `${common} bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-450 hover:to-orange-450 text-slate-950 shadow-[0_4px_15px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)]`;
      case 'info':
      default:
        return `${common} bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)]`;
    }
  };

  return (
    <AlertContext.Provider value={{ alert, confirm, toast }}>
      {children}

      {/* Global Alert Modal */}
      {alertState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className={`relative max-w-md w-full bg-slate-900 border rounded-2xl p-6 text-slate-100 ${getGlowClass(alertState.type)} transform scale-100 transition-all duration-300 animate-scale-up`}>
            <button
              onClick={closeAlert}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-4">
              <div className="shrink-0 mt-0.5">
                {getIcon(alertState.type)}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-100 pr-6">{alertState.title}</h3>
                <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-wrap">{alertState.message}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-slate-850">
              <button
                onClick={closeAlert}
                className={getButtonClass(alertState.type)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirm Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className={`relative max-w-md w-full bg-slate-900 border rounded-2xl p-6 text-slate-100 ${getGlowClass(confirmState.type)} transform scale-100 transition-all duration-300 animate-scale-up`}>
            <div className="flex gap-4">
              <div className="shrink-0 mt-0.5">
                {confirmState.type === 'warning' ? (
                  <HelpCircle className="w-6 h-6 text-amber-500" />
                ) : (
                  getIcon(confirmState.type)
                )}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-100">{confirmState.title}</h3>
                <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-wrap">{confirmState.message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-slate-850">
              <button
                onClick={() => handleConfirmResponse(false)}
                className="px-5 py-2 text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-750"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmResponse(true)}
                className={getButtonClass(confirmState.type)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Container */}
      <div className="fixed bottom-6 right-6 z-[10000] space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 bg-slate-900/95 border rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in-right ${
              t.type === 'success'
                ? 'border-emerald-500/20 text-slate-100 shadow-[0_4px_20px_rgba(16,185,129,0.1)]'
                : t.type === 'error'
                ? 'border-rose-500/20 text-slate-100 shadow-[0_4px_20px_rgba(239,68,68,0.1)]'
                : 'border-slate-800 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="shrink-0">{getIcon(t.type)}</div>
              <span className="text-xs font-semibold leading-normal">{t.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-slate-200 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

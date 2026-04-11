"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextType {
  showToast: (message: string, type?: NotificationType) => void;
  confirmAction: (message: string, onConfirm: () => void, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: NotificationType } | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; title: string; onConfirm: () => void } | null>(null);

  const showToast = useCallback((message: string, type: NotificationType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const confirmAction = useCallback((message: string, onConfirm: () => void, title: string = 'Confirmar acción') => {
    setConfirm({ message, title, onConfirm });
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, confirmAction }}>
      {children}
      
      {/* UI de Toast */}
      {toast && (
        <div className={`global-toast ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <div className="toast-progress"></div>
        </div>
      )}

      {/* UI de Modal de Confirmación */}
      {confirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <h3>{confirm.title}</h3>
            <p>{confirm.message}</p>
            <div className="confirm-modal-actions">
              <button className="btn-cancel" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn-confirm" onClick={() => { confirm.onConfirm(); setConfirm(null); }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .global-toast {
          position: fixed;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          background: var(--clr-text);
          color: var(--clr-bg);
          padding: 0.8rem 1.4rem;
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          min-width: 300px;
          overflow: hidden;
          animation: slideInDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .toast-content { display: flex; alignItems: center; gap: 12px; }
        .toast-icon { font-size: 1.2rem; }
        .toast-message { font-size: 0.9rem; font-weight: 500; }
        
        .global-toast.success { border-left: 5px solid var(--clr-success); }
        .global-toast.error { border-left: 5px solid var(--clr-danger); }
        .global-toast.info { border-left: 5px solid var(--clr-primary); }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: rgba(255,255,255,0.2);
          width: 100%;
          animation: progress 4s linear forwards;
        }

        .confirm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          animation: fadeIn 0.3s ease;
        }
        .confirm-modal-card {
          background: var(--clr-surface);
          padding: 2rem;
          border-radius: 20px;
          width: 90%;
          max-width: 400px;
          box-shadow: var(--shadow-xl);
          text-align: center;
        }
        .confirm-modal-card h3 { color: var(--clr-text); margin-bottom: 1rem; }
        .confirm-modal-card p { color: var(--clr-text-muted); margin-bottom: 2rem; line-height: 1.5; }
        .confirm-modal-actions { display: flex; gap: 1rem; }
        
        .btn-cancel, .btn-confirm {
          flex: 1;
          padding: 0.8rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: 0.2s;
        }
        .btn-cancel { background: var(--clr-border); color: var(--clr-text-muted); }
        .btn-confirm { background: var(--clr-navy-mid); color: var(--clr-bg); }
        .btn-confirm:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

        @keyframes slideInDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes progress { from { width: 100%; } to { width: 0%; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

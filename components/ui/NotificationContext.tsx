"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

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
              {toast.type === 'success'
                ? '✓'
                : toast.type === 'error'
                  ? '⚠️'
                  : toast.type === 'warning'
                    ? '!'
                    : 'ℹ️'}
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

    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

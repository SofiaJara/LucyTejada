'use client';
import { useState, useCallback } from 'react';

export default function usePopup() {
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar'
  });

  const showPopup = useCallback(({ title = '', message, type = 'info', onConfirm = null, confirmText = 'Aceptar', cancelText = 'Cancelar' }) => {
    setPopupState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText
    });
  }, []);

  const showAlert = useCallback((message, type = 'info', title = '') => {
    showPopup({ title, message, type });
  }, [showPopup]);

  const showSuccess = useCallback((message, title = '¡Éxito!') => {
    showPopup({ title, message, type: 'success' });
  }, [showPopup]);

  const showError = useCallback((message, title = 'Error') => {
    showPopup({ title, message, type: 'error' });
  }, [showPopup]);

  const showWarning = useCallback((message, title = 'Advertencia') => {
    showPopup({ title, message, type: 'warning' });
  }, [showPopup]);

  const showConfirm = useCallback((message, onConfirm, title = '¿Estás seguro?', confirmText = 'Confirmar', cancelText = 'Cancelar') => {
    showPopup({ 
      title, 
      message, 
      type: 'confirm', 
      onConfirm,
      confirmText,
      cancelText
    });
  }, [showPopup]);

  const closePopup = useCallback(() => {
    setPopupState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    popupState,
    showPopup,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    closePopup
  };
}

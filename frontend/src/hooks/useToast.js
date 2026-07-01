import { useState, useCallback } from 'react';

const ICONS = { success: '✓', error: '✗', upload: '☁', album: '📁', copy: '📋' };

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, icon: ICONS[type] || '✓' }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  return { toasts, addToast };
}

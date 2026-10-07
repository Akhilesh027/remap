import React, { useState, useEffect } from 'react';

let showToastFn;

export const ToastContainer = () => {
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    showToastFn = (message, type = 'info') => {
      setToast({ message, type });
      setTimeout(() => setToast({ message: '', type: '' }), 3000);
    };
  }, []);

  if (!toast.message) return null;

  const bgColor =
    toast.type === 'success'
      ? 'bg-green-500'
      : toast.type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`${bgColor} text-white px-4 py-2 rounded-lg shadow`}>
        {toast.message}
      </div>
    </div>
  );
};

export const toast = (message, type) => {
  showToastFn(message, type);
};

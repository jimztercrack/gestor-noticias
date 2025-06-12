import React, { useState, useEffect } from 'react';

const ConnectivityAlert = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setIsOnline(navigator.onLine);
    }, 10000); // Comprobación cada 5 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    !isOnline && (
      <div style={alertStyle}>
        No hay conexión a Internet. Por favor, verifique su conexión.
      </div>
    )
  );
};

const alertStyle = {
  position: 'fixed',
  top: 0,
  width: '100%',
  backgroundColor: 'red',
  color: 'white',
  textAlign: 'center',
  padding: '10px 0',
  zIndex: 1000,
};

export default ConnectivityAlert;
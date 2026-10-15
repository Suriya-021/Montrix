import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Download } from 'lucide-react';
import './OfflineBanner.css';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (showReconnected) {
    return (
      <div className="offline-banner online">
        <Wifi size={14} />
        <span>Connection restored. Ledger synchronized.</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="offline-banner offline">
        <WifiOff size={14} />
        <span>Offline mode — Local cache active.</span>
      </div>
    );
  }

  if (deferredPrompt) {
    return (
      <div 
        className="offline-banner online" 
        style={{ cursor: 'pointer', background: 'rgba(99, 102, 241, 0.18)', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#c7d2fe' }}
        onClick={handleInstallClick}
        title="Install Montrix App"
      >
        <Download size={14} />
        <span>Install Montrix App</span>
      </div>
    );
  }

  return null;
}

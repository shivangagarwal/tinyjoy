'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInit() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed silently — non-critical
      });
    }

    // Capture install prompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Only show banner if not already installed (standalone mode)
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Suppress for this session
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  // Don't show if dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem('pwa-banner-dismissed')) {
      setShowBanner(false);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-zinc-900 border-t border-zinc-800 px-4 py-3 text-sm"
      role="banner"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>🎮</span>
        <span className="text-zinc-200">
          Add TinyJoy to your home screen for quick access
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="rounded-md bg-orange-500 px-3 py-1.5 text-white font-medium hover:bg-orange-400 transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-md px-2 py-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

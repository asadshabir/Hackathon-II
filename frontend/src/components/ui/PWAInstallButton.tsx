'use client';

import { usePWA } from '@/contexts/PWAContext';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PWAInstallButton() {
  const { isInstallable, installPWA, isPWASupported } = usePWA();
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the user is on iOS (which has special PWA installation instructions)
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Only show the button if the app is installable and supported
    if (isPWASupported && isInstallable) {
      setShowButton(true);
    } else if (isIOSDevice) {
      // Show install instructions for iOS users
      setShowButton(true);
    }
  }, [isInstallable, isPWASupported]);

  if (!showButton) return null;

  if (isIOS) {
    // Special instructions for iOS users
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <div
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center animate-in slide-in-from-bottom-4 duration-300"
          style={{ background: 'rgba(17,19,24,0.95)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">Install App</span>
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-white/70 mb-2">
            Add to Home Screen for full app experience
          </p>
          <div className="text-[10px] text-white/60 font-mono bg-black/20 rounded-lg p-2">
            Tap <strong className="text-white">Share</strong> →{' '}
            <strong className="text-white">Add to Home Screen</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div
        className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300"
        style={{ background: 'rgba(79,70,229,0.12)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">TaskFlow AI</h3>
            <p className="text-xs text-white/70">Install for offline use</p>
          </div>
          <Button
            onClick={installPWA}
            className="h-9 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <Download className="w-4 h-4 mr-1" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
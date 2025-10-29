'use client';

import { useEffect } from 'react';

interface ServiceWorkerLoaderProps {
    swFilePath: string;
}

export default function ServiceWorkerLoader({ swFilePath }: ServiceWorkerLoaderProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(swFilePath)
        .catch((registrationError) => {
          console.warn('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return null;
}
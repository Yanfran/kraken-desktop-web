import { useState, useEffect } from 'react';

const SUPPORTED_COUNTRIES = [
  { id: 'KV', name: 'Venezuela', flag: '🇻🇪', iso: 'VE' },
  { id: 'KE', name: 'España',    flag: '🇪🇸', iso: 'ES' },
  { id: 'KU', name: 'USA',       flag: '🇺🇸', iso: 'US' },
];

export const useCountryDetection = () => {
  const [detectedPrefix, setDetectedPrefix]   = useState(null);
  const [isDetecting,    setIsDetecting]       = useState(true);
  const [detectionError, setDetectionError]    = useState(false);

  useEffect(() => {
    const detect = async () => {
      try {
        // API gratuita, no requiere key
        const res  = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const iso  = data?.country_code?.toUpperCase();

        const match = SUPPORTED_COUNTRIES.find(c => c.iso === iso);
        setDetectedPrefix(match?.id ?? 'KV'); // fallback Venezuela
      } catch {
        setDetectionError(true);
        setDetectedPrefix('KV');
      } finally {
        setIsDetecting(false);
      }
    };

    detect();
  }, []);

  return { detectedPrefix, isDetecting, detectionError, SUPPORTED_COUNTRIES };
};
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => { setOnline(true); toast.success('Back online!'); };
    const onOffline = () => { setOnline(false); toast.error('Reconnecting...', { duration: Infinity, id: 'offline' }); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  return online;
}

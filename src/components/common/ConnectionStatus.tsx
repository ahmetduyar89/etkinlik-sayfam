import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/** Ağ durumu yalnızca bağlantı kesildiğinde görünür; sunucu senkronizasyonu iddiası taşımaz. */
export function ConnectionStatus() {
    const [offline, setOffline] = useState(() => !navigator.onLine);
    useEffect(() => {
        const sync = () => setOffline(!navigator.onLine);
        window.addEventListener('online', sync);
        window.addEventListener('offline', sync);
        return () => {
            window.removeEventListener('online', sync);
            window.removeEventListener('offline', sync);
        };
    }, []);
    if (!offline) return null;
    return (
        <div role="status" className="app-connection-status">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>İnternet bağlantısı yok. Etkinliklerin yüklenmesi ve değişikliklerin eşitlenmesi için yeniden bağlanın.</span>
        </div>
    );
}

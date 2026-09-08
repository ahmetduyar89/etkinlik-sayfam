// src/AppShell.tsx — ATÖLYE KABUĞU
// ─────────────────────────────────────────────────────────────────────
// Kök adres (atölye.tedrisedu.com) artık bölüm kartlarının bulunduğu
// "Atölye" ana sayfasını açar. Buradan seçilen bölüm bu kabuğun içinde
// gösterilir; statik projeler (satranç, deneyler) kendi klasörlerinden
// normal bağlantı olarak açılır.
//
// Öğrenci bağlantıları (?view=student&id=… / ?view=notebook&id=…) hiç
// değişmedi: bu kabuk onları doğrudan içerik uygulamasına geçirir.
// ─────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import App from './App';
import { PortalHome } from './components/portal/PortalHome';
import { goToSection, sectionFromLocation, type Section } from './lib/navigation';
import { isStudentLink } from './utils/auth';

export default function AppShell() {
    const [section, setSection] = useState<Section>(sectionFromLocation);

    // Tarayıcının geri/ileri tuşları ve goToSection() aynı olayı tetikler.
    useEffect(() => {
        const sync = () => setSection(sectionFromLocation());
        window.addEventListener('popstate', sync);
        return () => window.removeEventListener('popstate', sync);
    }, []);

    // Öğrenciye gönderilen bağlantılar atölye ekranını atlar.
    if (isStudentLink()) return <App />;

    if (section === 'portal') {
        return <PortalHome onOpenInternal={goToSection} />;
    }

    return <App onExitToPortal={() => goToSection('portal')} />;
}

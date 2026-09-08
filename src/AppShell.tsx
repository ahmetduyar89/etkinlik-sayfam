// src/AppShell.tsx — ATÖLYE KABUĞU
// ─────────────────────────────────────────────────────────────────────
// Kök adres (atölye.tedrisedu.com) bölüm kartlarının bulunduğu "Atölye"
// ana sayfasını açar. Kartlardan seçilen bölüm bu kabuğun içinde gösterilir;
// statik projeler (satranç, deneyler) kendi klasörlerinden normal bağlantı
// olarak açılır.
//
// İçerikler ve Defterlerim aynı uygulamanın iki görünümüdür; ana sayfada
// ayrı kartları vardır ve her birinin kendi adresi olur (/etkinlikler,
// /defterlerim). Uygulamanın içindeki sekmeyle geçiş yapıldığında adres
// çubuğu da güncellenir, böylece geri tuşu ve yer imleri doğru çalışır.
//
// Öğrenci bağlantıları (?view=student&id=… / ?view=notebook&id=…) hiç
// değişmedi: bu kabuk onları doğrudan içerik uygulamasına geçirir.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import App from './App';
import { PortalHome } from './components/portal/PortalHome';
import { findModule, findModuleByView } from './constants/portal';
import { goToSection, sectionFromLocation, type Section } from './lib/navigation';
import { isStudentLink } from './utils/auth';
import type { MainView } from './types';

export default function AppShell() {
    const [section, setSection] = useState<Section>(sectionFromLocation);

    // Tarayıcının geri/ileri tuşları ve goToSection() aynı olayı tetikler.
    useEffect(() => {
        const sync = () => setSection(sectionFromLocation());
        window.addEventListener('popstate', sync);
        return () => window.removeEventListener('popstate', sync);
    }, []);

    // Uygulama içindeki sekme değişimi adres çubuğuna yansısın.
    const handleViewChange = useCallback((view: MainView) => {
        const target = findModuleByView(view);
        if (target) goToSection(target.id);
    }, []);

    // Öğrenciye gönderilen bağlantılar atölye ekranını atlar.
    if (isStudentLink()) return <App />;

    if (section === 'portal') {
        return <PortalHome onOpenInternal={goToSection} />;
    }

    return (
        <App
            view={findModule(section)?.view ?? 'content'}
            onViewChange={handleViewChange}
            onExitToPortal={() => goToSection('portal')}
        />
    );
}

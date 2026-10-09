// src/AppShell.tsx — ATÖLYE KABUĞU (Admin ve Sınıf Yönlendiricisi)
// ─────────────────────────────────────────────────────────────────────
// Kök adres (atölye.tedrisedu.com) oturum türüne göre açılır:
//   • Admin / Öğretmen oturumu: Tüm bölüm kartlarının olduğu "Atölye" ana sayfası
//     ve Sınıf Yönetim Paneli.
//   • Sınıf oturumu: Yalnızca o sınıfa tanımlanmış satranç, deney, defter ve
//     etkinlikleri içeren "Sınıf Çalışma Alanı" (ClassroomDashboard).
//
// Öğrenci bağlantıları (?view=student&id=… / ?view=notebook&id=…) doğrudan
// ilgili içeriğe yönlendirir. Canlı Satranç (?view=satranc) kendi ekranını açar.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import App from './App';
import { StudentWorkspace } from './components/student/StudentWorkspace';
import { ChessArena } from './components/chess/ChessArena';
import { PortalHome } from './components/portal/PortalHome';
import { ClassroomDashboard } from './components/classrooms/ClassroomDashboard';
import { ClassAdminDashboard } from './components/classrooms/ClassAdminDashboard';
import { findFolder, findModule, findModuleByView } from './constants/portal';
import { goToSection, sectionFromLocation, type Section } from './lib/navigation';
import { isChessLink, isStudentLink, getSession } from './utils/auth';
import type { MainView, ClassRoom } from './types';

export default function AppShell() {
    const [section, setSection] = useState<Section>(sectionFromLocation);
    const [previewClass, setPreviewClass] = useState<ClassRoom | null>(null);
    const session = getSession();
    const isClassMode = session?.role === 'class';

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

    if (new URLSearchParams(location.search).get('view') === 'ogrenci') return <StudentWorkspace />;

    // Öğrenciye gönderilen bağlantılar atölye ekranını atlar.
    if (isStudentLink()) return <App />;

    // Canlı Satranç kendi başına bir sayfadır.
    if (isChessLink()) return <ChessArena />;

    if (session?.role === 'student') return <StudentWorkspace />;

    // Sınıf oturumu açıldıysa veya Admin bir sınıfı önizliyorsa
    if (previewClass || isClassMode) {
        if (section === 'portal') {
            return (
                <ClassroomDashboard
                    classRoom={previewClass}
                    onReturnToAdmin={() => setPreviewClass(null)}
                    onOpenInternalModule={(v) => handleViewChange(v as MainView)}
                />
            );
        }

        return (
            <App
                view={findModule(section)?.view ?? 'content'}
                onViewChange={handleViewChange}
                onExitToPortal={() => goToSection('portal')}
            />
        );
    }

    // Normal Admin (Öğretmen) Paneli
    if (section === 'siniflar') {
        return (
            <ClassAdminDashboard
                onBack={() => goToSection('portal')}
                onPreviewClass={(classRoom) => {
                    setPreviewClass(classRoom);
                    goToSection('portal');
                }}
            />
        );
    }

    const folder = findFolder(section);
    if (section === 'portal' || folder) {
        return (
            <PortalHome
                key={section}
                folder={folder}
                onOpenInternal={goToSection}
            />
        );
    }

    return (
        <App
            view={findModule(section)?.view ?? 'content'}
            onViewChange={handleViewChange}
            onExitToPortal={() => goToSection('portal')}
        />
    );
}

// src/components/common/Navbar.tsx — İÇERİK MERKEZİ RESKIN (açık tema)
// Üst başlık = marka + GENİŞ ARAMA + "Yeni İçerik" + avatar.
// Arama state'i App.tsx'te yaşar; buraya props ile gelir.
import { LayoutGrid, LogOut, NotebookPen, Plus, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FullscreenToggle } from './FullscreenToggle';
import { InstallAppButton } from './InstallAppButton';
import { lockApp } from '../../utils/auth';

export type MainView = 'content' | 'notebooks';

interface NavbarProps {
    search: string;
    onSearchChange: (v: string) => void;
    onAdd: () => void;
    view: MainView;
    onViewChange: (v: MainView) => void;
}

export function Navbar({ search, onSearchChange, onAdd, view, onViewChange }: NavbarProps) {
    const isContent = view === 'content';
    return (
        <header className="bg-white font-sans top-0 sticky z-[100] border-b border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-6 w-full px-6 py-3 max-w-[1280px] mx-auto">
                {/* Marka */}
                <div className="flex items-center flex-shrink-0">
                    <span className="text-[19px] font-extrabold tracking-tight text-on-surface font-headline-lg">
                        Ahmet <span className="text-primary">DUYAR</span>
                    </span>
                    <span className="ml-3 pl-3 border-l border-outline-variant text-[13.5px] font-semibold text-on-surface-variant whitespace-nowrap hidden sm:inline">
                        İçerik Merkezi
                    </span>
                </div>

                {/* Bölüm değiştirici: İçerik Merkezi ↔ Defterlerim */}
                <nav className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1 flex-shrink-0">
                    {([
                        { id: 'content' as const, label: 'İçerikler', icon: LayoutGrid },
                        { id: 'notebooks' as const, label: 'Defterlerim', icon: NotebookPen },
                    ]).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onViewChange(tab.id)}
                            aria-current={view === tab.id ? 'page' : undefined}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors',
                                view === tab.id
                                    ? 'bg-white text-primary shadow-[0_1px_3px_rgba(15,23,42,0.10)]'
                                    : 'text-on-surface-variant hover:text-on-surface'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Geniş arama (yalnızca içerik merkezinde) */}
                <div
                    className={cn(
                        'flex-1 max-w-[620px] items-center gap-2.5 bg-surface-container-high border-[1.5px] border-transparent focus-within:bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.16)] rounded-2xl px-4 py-2.5 transition-all',
                        isContent ? 'flex' : 'hidden'
                    )}
                >
                    <Search className="w-[18px] h-[18px] text-on-surface-variant flex-shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="İçerik, konu veya tür ara…"
                        className="flex-1 bg-transparent outline-none text-[13.5px] text-on-surface placeholder-on-surface-variant"
                    />
                    {search && (
                        <button onClick={() => onSearchChange('')} className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] leading-none flex items-center justify-center">✕</button>
                    )}
                </div>

                {/* Uygulama olarak yükle (tarayıcı destekliyorsa görünür) */}
                <InstallAppButton />

                {/* Tam ekran (yalnızca bilgisayarda görünür) */}
                <FullscreenToggle />

                {!isContent && <div className="flex-1" />}

                {/* Yeni İçerik + avatar */}
                {isContent && (
                <button
                    onClick={onAdd}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-[13.5px] font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.28)] hover:-translate-y-0.5 hover:brightness-105 transition-all"
                >
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Yeni İçerik</span>
                </button>
                )}
                <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                    AD
                </div>

                {/* Çıkış: şifre ekranına döner */}
                <button
                    onClick={lockApp}
                    aria-label="Çıkış yap"
                    title="Çıkış yap"
                    className="flex-shrink-0 p-2 rounded-xl text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}

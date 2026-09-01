// src/components/common/Navbar.tsx — İÇERİK MERKEZİ (Ünite Rafı + Ders Modu)
// Üst başlık = marka + sekmeler + GENİŞ ARAMA (Ctrl+K) + Ders Modu + "Yeni İçerik".
// Arama state'i App.tsx'te yaşar; buraya props ile gelir.
import { forwardRef } from 'react';
import { LayoutGrid, LogOut, Menu, MonitorPlay, NotebookPen, Plus, Search } from 'lucide-react';
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
    isLessonMode: boolean;
    onToggleLessonMode: () => void;
    /** Ağaç çekmecesini açar (yalnızca <1024px'te görünür). */
    onOpenTree: () => void;
}

export const Navbar = forwardRef<HTMLInputElement, NavbarProps>(function Navbar(
    { search, onSearchChange, onAdd, view, onViewChange, isLessonMode, onToggleLessonMode, onOpenTree },
    searchRef
) {
    const isContent = view === 'content';
    return (
        <header className="bg-white font-sans top-0 sticky z-[100] border-b border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 sm:gap-3 xl:gap-[18px] w-full px-4 sm:px-6 py-3 max-w-[1440px] mx-auto">
                {/* Ağaç çekmecesi (dar ekran) */}
                <button
                    type="button"
                    onClick={onOpenTree}
                    aria-label="Kütüphane menüsü"
                    className={cn(
                        'flex-shrink-0 w-11 h-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors',
                        isContent ? 'flex lg:hidden' : 'hidden'
                    )}
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Marka */}
                <span className="text-[19px] font-extrabold tracking-[-0.02em] text-on-surface font-headline-lg flex-shrink-0 hidden xl:inline">
                    Ahmet <span className="text-primary">DUYAR</span>
                </span>

                {/* Bölüm değiştirici: İçerikler ↔ Defterlerim */}
                <nav className="flex items-center gap-1 bg-surface-container-high rounded-[14px] p-1 flex-shrink-0">
                    {([
                        { id: 'content' as const, label: 'İçerikler', icon: LayoutGrid },
                        { id: 'notebooks' as const, label: 'Defterlerim', icon: NotebookPen },
                    ]).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onViewChange(tab.id)}
                            aria-current={view === tab.id ? 'page' : undefined}
                            className={cn(
                                'inline-flex items-center gap-[7px] h-11 px-4 rounded-[10px] text-sm font-semibold transition-colors',
                                view === tab.id
                                    ? 'bg-white text-primary shadow-[0_1px_3px_rgba(15,23,42,0.10)]'
                                    : 'text-on-surface-variant hover:text-on-surface'
                            )}
                        >
                            <tab.icon className="w-[19px] h-[19px]" />
                            <span className="hidden lg:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Geniş arama (yalnızca içerik merkezinde) */}
                <div
                    className={cn(
                        'flex-1 min-w-0 max-w-[560px] h-12 items-center gap-2 sm:gap-3 bg-surface-container-high border-[1.5px] border-transparent focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.16)] rounded-2xl px-4 transition-all',
                        isContent ? 'flex' : 'hidden'
                    )}
                >
                    <Search className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                    <input
                        ref={searchRef}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Etkinlik, ünite veya tür ara…"
                        className="flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-[14.5px] text-on-surface placeholder-on-surface-variant focus:ring-0"
                    />
                    {search ? (
                        <button
                            onClick={() => onSearchChange('')}
                            aria-label="Aramayı temizle"
                            className="flex-shrink-0 w-5 h-5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] leading-none flex items-center justify-center"
                        >
                            ✕
                        </button>
                    ) : (
                        <span className="flex-shrink-0 text-[11.5px] font-bold text-on-surface-variant bg-white border border-outline-variant rounded-[7px] px-2 py-1 hidden lg:inline">
                            Ctrl K
                        </span>
                    )}
                </div>

                {!isContent && <div className="flex-1" />}

                {/* Ders Modu: koyu "devam eden ders" şeridini açar/kapatır */}
                {isContent && (
                    <button
                        onClick={onToggleLessonMode}
                        aria-pressed={isLessonMode}
                        title="Ders Modu"
                        className={cn(
                            'flex-shrink-0 hidden sm:inline-flex items-center gap-2 h-12 px-[18px] rounded-[14px] text-sm font-semibold transition-all',
                            isLessonMode
                                ? 'bg-inverse-surface text-white shadow-[0_4px_12px_rgba(15,23,42,0.22)]'
                                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                        )}
                    >
                        <MonitorPlay className="w-5 h-5" />
                        <span className="hidden xl:inline">Ders Modu</span>
                    </button>
                )}

                {/* Uygulama olarak yükle (tarayıcı destekliyorsa görünür) */}
                <InstallAppButton />

                {/* Tam ekran (yalnızca bilgisayarda görünür) */}
                <FullscreenToggle />

                {/* Çıkış: şifre ekranına döner */}
                <button
                    onClick={lockApp}
                    aria-label="Çıkış yap"
                    title="Çıkış yap"
                    className="flex-shrink-0 p-2 rounded-xl text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-[18px] h-[18px]" />
                </button>

                {/* Yeni İçerik + avatar */}
                {isContent && (
                    <button
                        onClick={onAdd}
                        className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-white h-12 px-[18px] rounded-[14px] text-sm font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.28)] hover:-translate-y-0.5 hover:brightness-105 transition-all"
                    >
                        <Plus className="w-[19px] h-[19px]" /> <span className="hidden sm:inline">Yeni İçerik</span>
                    </button>
                )}
                <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-primary to-secondary text-white hidden sm:flex items-center justify-center font-bold text-sm flex-shrink-0">
                    AD
                </div>
            </div>
        </header>
    );
});

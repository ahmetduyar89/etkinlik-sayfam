// src/components/common/Navbar.tsx — İÇERİK MERKEZİ RESKIN (açık tema)
// Üst başlık = marka + GENİŞ ARAMA + "Yeni İçerik" + avatar.
// Arama state'i App.tsx'te yaşar; buraya props ile gelir.
import { Plus, Search } from 'lucide-react';
import { FullscreenToggle } from './FullscreenToggle';

interface NavbarProps {
    search: string;
    onSearchChange: (v: string) => void;
    onAdd: () => void;
}

export function Navbar({ search, onSearchChange, onAdd }: NavbarProps) {
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

                {/* Geniş arama */}
                <div className="flex-1 max-w-[620px] flex items-center gap-2.5 bg-surface-container-high border-[1.5px] border-transparent focus-within:bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.16)] rounded-2xl px-4 py-2.5 transition-all">
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

                {/* Tam ekran (yalnızca bilgisayarda görünür) */}
                <FullscreenToggle />

                {/* Yeni İçerik + avatar */}
                <button
                    onClick={onAdd}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-[13.5px] font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.28)] hover:-translate-y-0.5 hover:brightness-105 transition-all"
                >
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Yeni İçerik</span>
                </button>
                <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                    AD
                </div>
            </div>
        </header>
    );
}

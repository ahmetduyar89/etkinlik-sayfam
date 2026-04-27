import { Settings, User } from 'lucide-react';
import { IconButton } from './IconButton';

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
            <nav
                aria-label="Ana gezinti"
                className="container mx-auto max-w-6xl flex justify-between items-center pointer-events-auto glass-effect rounded-2xl px-6 py-3"
            >
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 overflow-hidden border border-slate-100 p-1">
                        <img src="/src/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-black tracking-tight text-slate-800 leading-none">
                            Ahmet DUYAR
                        </h1>
                        <p className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase mt-1">
                            Eğitim & Fen Bilimleri
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-1 mr-2">
                        <IconButton icon={Settings} aria-label="Ayarlar" title="Ayarlar" />
                    </div>
                    <div
                        aria-hidden="true"
                        className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center"
                    >
                        <User className="w-4 h-4 text-neutral-500" />
                    </div>
                </div>
            </nav>
        </header>
    );
}

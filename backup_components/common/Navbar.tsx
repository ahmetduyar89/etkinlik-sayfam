import { Command, Settings, User } from 'lucide-react';
import { IconButton } from './IconButton';

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
            <nav
                aria-label="Ana gezinti"
                className="container mx-auto max-w-6xl flex justify-between items-center pointer-events-auto glass-effect rounded-2xl px-6 py-3"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Command className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-wider text-slate-800 uppercase">
                            A. Duyar
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                            İnteraktif Merkez
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

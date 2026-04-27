export function Navbar() {
    return (
        <header className="bg-slate-950/80 backdrop-blur-xl docked full-width top-0 sticky z-[100] border-b border-white/10 shadow-[0_0_20px_rgba(124,58,237,0.1)]">
            <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 overflow-hidden border border-slate-100 p-1">
                        <img src="/src/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-2xl font-black italic tracking-tighter text-white font-headline-xl antialiased">
                        Ahmet DUYAR
                    </div>
                </div>
                
                <nav className="hidden md:flex items-center space-x-8">
                    <a className="text-slate-400 hover:text-white transition-colors font-headline-md antialiased tracking-tight text-sm" href="#">Keşfet</a>
                    <a className="text-slate-400 hover:text-white transition-colors font-headline-md antialiased tracking-tight text-sm" href="#">Kategoriler</a>
                    <a className="text-slate-400 hover:text-white transition-colors font-headline-md antialiased tracking-tight text-sm" href="#">Hakkında</a>
                    
                    <div className="relative group">
                        <span className="material-symbols-outlined text-white p-2 hover:bg-white/5 transition-all duration-300 rounded-full cursor-pointer">notifications</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-primary-container rounded-full"></span>
                    </div>
                    <span className="material-symbols-outlined text-white p-2 hover:bg-white/5 transition-all duration-300 rounded-full cursor-pointer">account_circle</span>
                </nav>
                
                <div className="md:hidden">
                    <span className="material-symbols-outlined text-white">menu</span>
                </div>
            </div>
        </header>
    );
}

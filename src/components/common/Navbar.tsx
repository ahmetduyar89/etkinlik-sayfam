export function Navbar() {
    return (
        <header className="bg-surface font-sans top-0 sticky z-[100] border-b border-white/5">
            <div className="flex justify-between items-center w-full px-8 py-5 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-10">
                    <div className="text-xl font-extrabold tracking-tight text-white uppercase">
                        Ahmet DUYAR
                    </div>
                    <nav className="hidden md:flex items-center space-x-6">
                        <a className="text-on-surface text-sm font-semibold relative pb-1 group antialiased" href="#">
                            Keşfet
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4d8eff] rounded-full"></span>
                        </a>
                        <a className="text-on-surface-variant hover:text-white transition-colors text-sm font-semibold antialiased" href="#">Kategoriler</a>
                        <a className="text-on-surface-variant hover:text-white transition-colors text-sm font-semibold antialiased" href="#">Hakkında</a>
                    </nav>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer text-on-surface-variant hover:text-white transition-colors p-1.5">
                        <span className="material-symbols-outlined !text-[22px]">notifications</span>
                    </div>
                    <div className="cursor-pointer text-on-surface-variant hover:text-white transition-colors p-1.5">
                        <span className="material-symbols-outlined !text-[22px]">account_circle</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

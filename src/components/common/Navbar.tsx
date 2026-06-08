// src/components/common/Navbar.tsx — İÇERİK MERKEZİ RESKIN (açık tema)
// Tüm yapı korundu; yalnızca koyu sınıflar açık temaya çevrildi,
// marka "Ahmet DUYAR" + Poppins + indigo vurgu eklendi.
export function Navbar() {
    return (
        <header className="bg-white font-sans top-0 sticky z-[100] border-b border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-10">
                    <div className="text-[19px] font-extrabold tracking-tight text-on-surface font-headline-lg">
                        Ahmet <span className="text-primary">DUYAR</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-7">
                        <a className="text-on-surface text-sm font-semibold relative pb-1" href="#">
                            Keşfet
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
                        </a>
                        <a className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-semibold" href="#">Kategoriler</a>
                        <a className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-semibold" href="#">Hakkında</a>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <button className="w-[38px] h-[38px] rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center" title="Bildirimler">
                        <span className="material-symbols-outlined !text-[22px]">notifications</span>
                    </button>
                    <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-[13px] cursor-pointer">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
}

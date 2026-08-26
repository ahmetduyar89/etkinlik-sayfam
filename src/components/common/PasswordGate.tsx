// src/components/common/PasswordGate.tsx — Basit şifre ile giriş ekranı
// Doğru şifre girilene kadar site açılmaz. Giriş tarayıcıda hatırlanır.
// Öğrenci linkleri (?view=student&id=…) şifre istemez; öğrenciler doğrudan girer.
//
// NOT: Bu, tamamen tarayıcıda çalışan basit bir kilittir — meraklı bir kullanıcı
// sayfa kaynağından şifreyi görebilir. Gerçek koruma için ileride sunucu tarafı
// (ör. Firebase Authentication) gerekir.
import { useCallback, useEffect, useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
    APP_PASSWORD,
    AUTH_STORAGE_KEY,
    isAuthenticated,
    isStudentLink,
    saveAuth,
} from '../../utils/auth';

interface PasswordGateProps {
    children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
    const [isUnlocked, setIsUnlocked] = useState(isAuthenticated);
    const [value, setValue] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState(false);

    // Başka bir sekmede çıkış/giriş yapılırsa bu sekme de güncellensin.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === AUTH_STORAGE_KEY) setIsUnlocked(isAuthenticated());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (value.trim() !== APP_PASSWORD) {
                setError(true);
                setValue('');
                return;
            }
            saveAuth();
            setError(false);
            setIsUnlocked(true);
        },
        [value]
    );

    if (isUnlocked || isStudentLink()) return <>{children}</>;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[380px] bg-white border border-outline-variant rounded-[22px] shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-7 flex flex-col items-center gap-1"
            >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6" aria-hidden="true" />
                </div>

                <h1 className="text-[20px] font-bold font-headline-md text-on-surface tracking-tight">
                    Ahmet <span className="text-primary">DUYAR</span>
                </h1>
                <p className="text-[13px] text-on-surface-variant mb-5">
                    Devam etmek için şifreyi girin.
                </p>

                <label htmlFor="app-password" className="sr-only">
                    Şifre
                </label>
                <div
                    className={cn(
                        'w-full flex items-center gap-2 rounded-2xl px-4 py-3 border-[1.5px] transition-all',
                        error
                            ? 'border-red-400 bg-red-50 focus-within:shadow-[0_0_0_3px_rgba(248,113,113,0.18)]'
                            : 'border-transparent bg-surface-container-high focus-within:bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.16)]'
                    )}
                >
                    <input
                        id="app-password"
                        type={showPass ? 'text' : 'password'}
                        inputMode="numeric"
                        autoFocus
                        autoComplete="current-password"
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError(false);
                        }}
                        placeholder="Şifre"
                        aria-invalid={error}
                        aria-describedby={error ? 'app-password-error' : undefined}
                        className="flex-1 min-w-0 bg-transparent border-0 p-0 outline-none focus:ring-0 text-[15px] tracking-[0.3em] text-on-surface placeholder:tracking-normal placeholder-on-surface-variant"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        title={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                    >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <p
                    id="app-password-error"
                    role="alert"
                    className={cn(
                        'w-full text-[12.5px] font-semibold text-red-500 mt-2 min-h-[18px]',
                        !error && 'invisible'
                    )}
                >
                    Şifre hatalı, tekrar deneyin.
                </p>

                <button
                    type="submit"
                    className="w-full mt-2 bg-primary text-white py-3 rounded-xl text-[14px] font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.28)] hover:brightness-105 active:scale-[0.99] transition-all"
                >
                    Giriş Yap
                </button>
            </form>
        </div>
    );
}

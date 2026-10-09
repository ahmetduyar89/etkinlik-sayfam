import { useEffect, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Loader2, X } from 'lucide-react';
import { approveQrLogin, completeQrLogin, createQrLogin, inspectQrLogin, qrError, qrLoginUrl,
    type QrLoginRequest, type QrScan } from '../../lib/qrLogin';
import { clearSession, getSession } from '../../utils/auth';

const buttonClass = 'rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';

export function QrLoginDisplay() {
    const [request, setRequest] = useState<QrLoginRequest | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const generation = useRef(0);
    useEffect(() => () => { generation.current += 1; }, []);
    const create = async () => {
        const current = ++generation.current;
        setRequest(null); setError(''); setBusy(true);
        try {
            const next = await createQrLogin();
            if (generation.current === current) { setRequest(next); setSeconds(120); }
        } catch (err) {
            if (generation.current === current) setError(qrError(err));
        } finally {
            if (generation.current === current) setBusy(false);
        }
    };
    useEffect(() => {
        if (!request) return;
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;
        const countdown = setInterval(() => setSeconds(Math.max(0, Math.ceil((request.expiresAt - Date.now()) / 1000))), 1000);
        const poll = async () => {
            if (cancelled) return;
            if (Date.now() >= request.expiresAt) { setSeconds(0); return; }
            try {
                if (await completeQrLogin(request, () => !cancelled)) return;
            } catch (err) {
                if (!cancelled) setError(qrError(err));
                return;
            }
            if (!cancelled) timer = setTimeout(poll, 2500);
        };
        timer = setTimeout(poll, 2500);
        return () => { cancelled = true; clearTimeout(timer); clearInterval(countdown); };
    }, [request]);
    return <div className="mt-5 w-full border-t border-slate-100 pt-5 text-center">
        <h2 className="flex items-center justify-center gap-2 text-sm font-bold text-slate-800"><QrCode size={18} /> Telefonla giriş yap</h2>
        <p className="my-2 text-xs text-slate-500">Telefonunda hesabına giriş yap, bu ekrandaki QR kodu kamerayla okut ve onayla.</p>
        {request && seconds > 0 && !error && <>
            <div className="mx-auto my-3 w-fit rounded-xl border border-slate-200 bg-white p-3"><QRCodeSVG value={qrLoginUrl(request)} size={180} level="M" title="Telefonla giriş QR kodu" /></div>
            <p className="text-sm font-semibold text-slate-700">Ekran kodu: {request.code}</p>
            <p className="mt-1 text-xs text-slate-500" role="status">Telefon onayı bekleniyor · {seconds} saniye</p>
            <p className="mt-2 text-xs text-slate-500">Bu ekrandaki giriş tarayıcı kapatılınca sona erer.</p>
        </>}
        {request && seconds === 0 && !error && <p className="my-3 text-sm text-amber-700" role="status">QR kodun süresi doldu.</p>}
        {error && <p className="my-3 text-sm text-red-600" role="alert">{error}</p>}
        {(!request || seconds === 0 || error) && <button type="button" disabled={busy} onClick={() => void create()} className={`${buttonClass} mt-2`}>
            {busy ? <Loader2 className="mx-auto animate-spin" size={18} /> : request || error ? 'Yeni QR oluştur' : 'QR kodu göster'}
        </button>}
    </div>;
}

export function QrLoginApproval({ scan }: { scan: QrScan }) {
    const [details, setDetails] = useState<{ code: string; expiresAt: number } | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [expired, setExpired] = useState(false);
    const session = getSession();
    const { id, scanSecret } = scan;
    useEffect(() => {
        let cancelled = false;
        void inspectQrLogin({ id, scanSecret }).then((data) => { if (!cancelled) setDetails(data); })
            .catch((err) => { if (!cancelled) setError(qrError(err)); });
        return () => { cancelled = true; };
    }, [id, scanSecret]);
    useEffect(() => {
        if (!details) return;
        const timer = setTimeout(() => setExpired(true), Math.max(0, details.expiresAt - Date.now()));
        return () => clearTimeout(timer);
    }, [details]);
    const approve = async () => {
        setBusy(true); setError('');
        try { await approveQrLogin(scan); setDone(true); window.history.replaceState(null, '', '/'); }
        catch (err) { setError(qrError(err)); }
        finally { setBusy(false); }
    };
    const changeAccount = async () => {
        setBusy(true);
        try { clearSession(); await signOut(auth); window.location.reload(); }
        catch { setError('Hesap değiştirilemedi. Tekrar deneyin.'); setBusy(false); }
    };
    const label = session?.role === 'class' ? `${session.className} sınıf hesabı` : 'Öğretmen hesabı';
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
            <QrCode className="mx-auto mb-4 text-indigo-600" size={36} />
            <h1 className="text-xl font-bold text-slate-900">{done ? 'Giriş onaylandı' : 'Tahtada giriş yap'}</h1>
            {done ? <p className="my-4 text-sm text-slate-600">Sınıftaki ekran hesabını açacak. Telefonundaki oturum açık kalır.</p> : <>
                <p className="my-4 text-sm text-slate-600">Bu ekranda <strong>{label}</strong> açılacak.</p>
                {!details && !error && <Loader2 className="mx-auto animate-spin text-indigo-600" />}
                {details && <><p className="text-2xl font-bold tracking-widest text-indigo-600">{details.code}</p>
                    <p className="my-3 text-sm text-slate-500">Bu kodun giriş yapacağın ekrandaki kodla aynı olduğunu kontrol et.</p></>}
                {expired && <p className="my-3 text-sm text-amber-700">QR kodun süresi doldu. Tahtada yeni QR oluştur.</p>}
                {error && <><p className="my-3 text-sm text-red-600" role="alert">{error}</p><button type="button" onClick={() => window.location.reload()} className="mb-3 text-sm font-semibold text-indigo-600">Tekrar dene</button></>}
                <button type="button" onClick={() => void approve()} disabled={!details || busy || expired || Boolean(error)} className={`${buttonClass} w-full`}>
                    {busy ? 'Onaylanıyor…' : 'Girişi onayla'}
                </button>
            </>}
            {!done && <button type="button" onClick={() => void changeAccount()} disabled={busy} className="mt-4 text-sm font-semibold text-indigo-600 disabled:opacity-50">Başka hesapla giriş yap</button>}
            <a href="/" className="mt-4 block text-sm font-semibold text-slate-500">{done ? 'Ana sayfaya dön' : 'Vazgeç ve ana sayfaya dön'}</a>
        </div>
    </div>;
}

export function QrLoginHelpButton() {
    const [open, setOpen] = useState(false);
    return <>
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"><QrCode size={18} /><span className="hidden sm:inline">Tahtada giriş yap</span></button>
        {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-5" onClick={() => setOpen(false)}>
            <div role="dialog" aria-modal="true" aria-labelledby="qr-help-title" className="relative max-w-sm rounded-3xl bg-white p-7 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <button type="button" aria-label="Kapat" onClick={() => setOpen(false)} className="absolute right-3 top-3 p-2 text-slate-500"><X size={20} /></button>
                <h2 id="qr-help-title" className="mb-4 text-lg font-bold text-slate-900">Tahtada giriş yap</h2>
                <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-600"><li>Tahtada veya sınıf bilgisayarında bu siteyi aç.</li><li>Giriş ekranında “QR kodu göster” düğmesine bas.</li><li>Telefonunun kamerasıyla kodu okut.</li><li>Ekran kodlarını karşılaştır ve telefonunda girişi onayla.</li></ol>
                <p className="mt-4 text-xs text-slate-500">Telefonunda açık olan hesap tahtada açılır.</p>
            </div>
        </div>}
    </>;
}

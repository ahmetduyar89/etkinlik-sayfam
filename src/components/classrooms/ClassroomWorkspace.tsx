import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, LogOut, Monitor, WifiOff } from 'lucide-react';
import { classroomId } from '../../lib/classroomScope';
import { db } from '../../lib/firebase';
import { ClassroomContext, type Classroom } from '../../contexts/ClassroomContext';
import { lockApp } from '../../utils/auth';
export function ClassroomWorkspace({ children }: { children: React.ReactNode }) {
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [error, setError] = useState('');
    const [online, setOnline] = useState(navigator.onLine);
    useEffect(() => {
        const sync = () => setOnline(navigator.onLine);
        window.addEventListener('online', sync); window.addEventListener('offline', sync);
        return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync); };
    }, []);
    useEffect(() => {
        if (!classroomId) return;
        return onSnapshot(doc(db, 'classrooms', classroomId), snap => {
            if (!snap.exists()) { setClassroom(null); setError('Sınıf bulunamadı.'); return; }
            const data = { ...snap.data(), id: snap.id } as Classroom;
            setClassroom(data); setError('');
        }, () => { setClassroom(null); setError('Sınıf yüklenemedi. Bağlantınızı ve erişim yetkinizi kontrol edin.'); });
    }, []);
    if (error) return <main className="p-10 text-center"><p role="alert">{error}</p><a href="/" className="text-teal-700 underline">Sınıflara dön</a></main>;
    if (!classroom) return <div className="p-12 text-center" role="status">Sınıf açılıyor…</div>;
    return <ClassroomContext.Provider value={classroom}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#142c36] text-white text-sm">
            <a href="/" className="flex items-center gap-2"><ArrowLeft size={17}/> Sınıflar</a>
            <span className="flex items-center gap-2 font-semibold"><Monitor size={17}/>{classroom.name} <span className="font-normal text-slate-300">· {classroom.school_year}{classroom.archived ? ' · Arşiv' : ''}</span></span>
            <div className="flex gap-4 items-center">{!online && <span className="flex gap-2 items-center text-amber-200"><WifiOff size={16}/> Bulut bağlantısı bekleniyor</span>}<button onClick={() => void lockApp()} className="flex gap-2 items-center"><LogOut size={16}/> Çıkış</button></div>
        </div>
        {children}
    </ClassroomContext.Provider>;
}

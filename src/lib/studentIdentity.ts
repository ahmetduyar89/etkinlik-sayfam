import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import { saveSession } from '../utils/auth';
import { saveStudentSession, type ChessStudentSession } from './chess/player';

export function useStudentIdentity() {
    const [student, setStudent] = useState<ChessStudentSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let revision = 0;
        const stop = onAuthStateChanged(auth, async user => {
            const current = ++revision;
            setLoading(true); setStudent(null); setError('');
            try {
                const claims = user ? (await user.getIdTokenResult()).claims : null;
                if (claims?.role !== 'student' || typeof claims.classId !== 'string' || typeof claims.studentId !== 'string') return;
                const classroom = await getDocFromServer(doc(db, 'classes', claims.classId));
                const item = classroom.data()?.students?.find((s: { id: string; active?: boolean }) => s.id === claims.studentId && s.active !== false);
                if (!item) throw new Error('Öğrenci kaydı bulunamadı veya artık etkin değil.');
                if (current === revision) {
                    const session = { classId: claims.classId, studentId: claims.studentId, studentName: item.name, schoolNumber: item.schoolNumber };
                    saveStudentSession(session);
                    saveSession({ role: 'student', ...session });
                    setStudent(session);
                }
            } catch (e) { if (current === revision) setError(e instanceof Error ? e.message : 'Öğrenci bilgisi alınamadı.'); }
            finally { if (current === revision) setLoading(false); }
        });
        return () => { revision++; stop(); };
    }, []);
    return { student, loading, error };
}


import { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFirestore } from '../../lib/firebase';
import type { Submission } from '../../types';

interface ResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityId: string;
}

export function ResultsModal({ isOpen, onClose, activityId }: ResultsModalProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const submissionsHandler = useFirestore<Submission>('submissions');

    useEffect(() => {
        if (!isOpen) return;
        const unsub = submissionsHandler.sync((data) => {
            setSubmissions(data.filter((s) => s.activity_id === activityId));
        });
        return unsub;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, activityId]);

    const formatAnswers = (answers: Record<string, unknown>): string => {
        const entries = Object.entries(answers || {});
        if (entries.length === 0) return '';
        return entries
            .map(
                ([k, v]) =>
                    `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`
            )
            .join(' · ');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Öğrenci Sonuçları">
            <div className="space-y-4">
                {submissions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <caption className="sr-only">Öğrenci teslim listesi</caption>
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th scope="col" className="px-4 py-3 font-bold text-slate-600">
                                        Öğrenci Adı
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-bold text-slate-600">
                                        Başlangıç
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-bold text-slate-600">
                                        Teslim Tarihi
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-bold text-slate-600">
                                        Cevaplar
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub, idx) => (
                                    <tr
                                        key={sub.id}
                                        className={
                                            'border-b border-slate-50 transition-colors ' +
                                            (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40') +
                                            ' hover:bg-indigo-50/40'
                                        }
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {sub.student_name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                                            {sub.started_at
                                                ? new Date(sub.started_at).toLocaleString('tr-TR')
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                                            {sub.submitted_at
                                                ? new Date(sub.submitted_at).toLocaleString('tr-TR')
                                                : 'Tamamlanmadı'}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-indigo-600">
                                            <div className="space-y-1">
                                                {Object.keys(sub.answers || {}).length > 0 ? (
                                                    <div className="text-[11px] bg-indigo-50 p-2 rounded-lg font-medium text-indigo-700 max-w-[280px] break-words">
                                                        {formatAnswers(sub.answers)}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-neutral-300 font-normal italic">
                                                        Cevaplanmadı
                                                    </span>
                                                )}
                                                {!sub.submitted_at && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[9px] text-emerald-600 uppercase font-black tracking-widest">
                                                            CANLI
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Database className="w-8 h-8 text-slate-300" aria-hidden="true" />
                        </div>
                        <p className="text-slate-400 font-medium">
                            Henüz bir katılım bulunmuyor.
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}

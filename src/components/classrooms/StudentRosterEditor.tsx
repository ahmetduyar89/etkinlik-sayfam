import { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ClassStudent } from '../../types';

interface Props {
    students: ClassStudent[];
    onChange: (students: ClassStudent[]) => void;
    disabled?: boolean;
}

export function StudentRosterEditor({ students, onChange, disabled }: Props) {
    const numberInputs = useRef<Array<HTMLInputElement | null>>([]);
    const [bulkText, setBulkText] = useState('');
    const [bulkError, setBulkError] = useState('');
    const update = (id: string, patch: Partial<ClassStudent>) => onChange(students.map(s => s.id === id ? { ...s, ...patch } : s));
    const add = () => onChange([...students, { id: `st_${crypto.randomUUID()}`, name: '', schoolNumber: '', active: true }]);
    const importRows = () => {
        const rows = bulkText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        if (!rows.length) return;
        const next = students.map(s => ({ ...s }));
        for (const line of rows) {
            // Accept Excel columns, "1024 Ali Kaya", or "Ali Kaya 1024".
            const first = line.match(/^(\d{1,20})[\s;|,-]+(.+)$/);
            const last = !first && line.match(/^(.+?)[\s;|,]+(\d{1,20})$/);
            const name = (first?.[2] || (last ? last[1] : line)).trim();
            const schoolNumber = first?.[1] || (last ? last[2] : '');
            if (/^\d+$/.test(name)) { setBulkError('Yalnız numaraları ilgili öğrencinin numara kutusuna yapıştırın. Buraya ad soyad da ekleyin.'); return; }
            const existing = next.find(s => s.name.trim().toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'));
            if (existing) { if (schoolNumber) existing.schoolNumber = schoolNumber; }
            else next.push({ id: `st_${crypto.randomUUID()}`, name, schoolNumber, active: true });
        }
        onChange(next); setBulkText(''); setBulkError('');
    };
    const duplicateNumbers = new Set(students.filter((s, i) => s.schoolNumber && students.some((other, j) => j !== i && other.schoolNumber === s.schoolNumber)).map(s => s.schoolNumber));
    const missing = students.filter(s => !s.schoolNumber).length;
    return <div className="space-y-3">
        <p className="text-sm text-slate-600">Her öğrencinin yanına okul numarasını yazın. Enter ile sonraki numaraya geçin. Excel’deki numara sütununu kopyalayıp ilk numara kutusuna yapıştırabilirsiniz.</p>
        <p role="status" className="text-xs font-semibold text-slate-500">{students.length - missing} öğrencinin numarası girildi{missing ? ` · ${missing} öğrenciye numara gerekiyor` : ''}</p>
        <div className="space-y-2">
            {students.map((s, i) => <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_100px_40px] items-start gap-2 sm:grid-cols-[minmax(0,1fr)_140px_40px]">
                <div><label htmlFor={`student-name-${s.id}`} className="text-xs font-semibold text-slate-500">{i + 1}. Ad soyad</label><input id={`student-name-${s.id}`} disabled={disabled} value={s.name} onChange={e => update(s.id, { name: e.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500" /></div>
                <div><label htmlFor={`student-number-${s.id}`} className="text-xs font-semibold text-slate-500">Okul numarası</label><input ref={el => { numberInputs.current[i] = el; }} id={`student-number-${s.id}`} disabled={disabled} type="text" inputMode="numeric" autoComplete="off" maxLength={20} value={s.schoolNumber || ''} aria-invalid={duplicateNumbers.has(s.schoolNumber)} aria-label={`${s.name || `${i + 1}. öğrenci`} okul numarası`} placeholder="Numara" onChange={e => update(s.id, { schoolNumber: e.target.value.replace(/\D/g, '') })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); numberInputs.current[i + 1]?.focus(); } }} onPaste={e => {
                    const text = e.clipboardData.getData('text');
                    if (!/[\r\n\t]/.test(text.trim())) return;
                    e.preventDefault();
                    const numbers = text.trim().split(/\s+/);
                    if (numbers.some(n => !/^\d{1,20}$/.test(n)) || numbers.length > students.length - i) { setBulkError('Numaralar tek sütun olmalı ve kalan öğrenci sayısını aşmamalı.'); return; }
                    onChange(students.map((student, j) => j >= i && j < i + numbers.length ? { ...student, schoolNumber: numbers[j - i] } : student)); setBulkError('');
                    numberInputs.current[Math.min(i + numbers.length, students.length - 1)]?.focus();
                }} className={`mt-1 min-h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-indigo-500 ${duplicateNumbers.has(s.schoolNumber) ? 'border-red-400' : 'border-slate-200'}`} />{duplicateNumbers.has(s.schoolNumber) && <p className="mt-1 text-xs text-red-600">Numara tekrar ediyor</p>}</div>
                <button type="button" disabled={disabled} aria-label={`${s.name || `${i + 1}. öğrenci`} öğrencisini listeden çıkar`} onClick={() => onChange(students.filter(student => student.id !== s.id))} className="mt-6 flex min-h-11 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"><Trash2 size={17} /></button>
            </div>)}
        </div>
        <button type="button" disabled={disabled} onClick={add} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-indigo-200 px-3 text-sm font-bold text-indigo-700"><Plus size={16} />Öğrenci ekle</button>
        <details className="rounded-xl border border-slate-200 bg-white p-3"><summary className="cursor-pointer text-sm font-semibold text-slate-600">Excel’den veya listeden öğrenci ekle</summary><p className="my-2 text-xs text-slate-500">Her satıra ad soyad yazın; varsa numarayı başına veya sonuna ekleyin. Mevcut öğrencilerin kayıtları korunur.</p><textarea aria-label="Toplu öğrenci listesi" disabled={disabled} rows={4} value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder={'1024 Ali Kaya\n1025 Ece Yılmaz'} className="w-full rounded-xl border border-slate-200 p-3 text-sm" /><button type="button" disabled={disabled || !bulkText.trim()} onClick={importRows} className="mt-2 min-h-11 rounded-xl bg-indigo-50 px-4 text-sm font-bold text-indigo-700 disabled:opacity-50">Listeye ekle</button></details>
        {bulkError && <p role="alert" className="text-sm text-red-600">{bulkError}</p>}
    </div>;
}

export const GRADE_LEVELS = ['5', '6', '7', '8', '9', '10', '11', '12'] as const;

export const SUBJECTS = [
    'Türkçe',
    'Matematik',
    'Fen Bilimleri',
    'Sosyal Bilgiler',
    'İngilizce',
    'Din Kültürü ve Ahlak Bilgisi',
    'Fizik',
    'Kimya',
    'Biyoloji',
] as const;

export function formatGradeLevel(grade?: string) {
    return grade ? `${grade}. Sınıf` : 'Sınıf yok';
}

export function getGradeSortIndex(grade?: string) {
    const index = GRADE_LEVELS.findIndex((item) => item === grade);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function getSubjectSortIndex(subject?: string) {
    const index = SUBJECTS.findIndex((item) => item === subject);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

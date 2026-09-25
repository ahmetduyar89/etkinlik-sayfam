// src/types/classroom.ts — Sınıf ve Öğrenci Yönetimi Tipleri

export interface ClassStudent {
    id: string;
    name: string;
}

export interface ClassRoom {
    id: string;
    name: string;                   // örn: "4-A", "3-B", "Özel Ders - Can"
    username: string;               // örn: "4a" (küçük harf, boşluksuz)
    password: string;               // örn: "1234"
    grade?: string;                 // örn: "4"
    description?: string;
    assignedModules: string[];      // Portal modül kimlikleri (örn: ['satranc', 'deneyler', 'defterlerim'])
    assignedNotebooks: string[];    // Sınıfa atanan defter ID'leri
    assignedActivities: string[];   // İçerik merkezinden atanan etkinlik ID'leri
    assignedExperiments: string[];  // Sınıfa atanan deney dosya adları (örn: ['basit-pusula.html', 'isildayan-devre.html'])
    students: ClassStudent[];       // Satranç ve sınıf içi öğrenci kadrosu
    created_at?: string;
    updated_at?: string;
}

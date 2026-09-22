import { createContext, useContext } from 'react';
import type { Activity } from '../types';
export interface Classroom {
    id: string;
    name: string;
    grade_level: string;
    school_year: string;
    archived: boolean;
    activity_ids: string[];
    include_grade_content: boolean;
    created_at: string;
}
export const ClassroomContext = createContext<Classroom | null>(null);
export const useClassroom = () => useContext(ClassroomContext);
export function belongsToClass(activity: Activity, classroom: Classroom | null): boolean {
    return !classroom || classroom.activity_ids.includes(activity.id) || (classroom.include_grade_content && activity.grade_level === classroom.grade_level);
}

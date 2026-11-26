export type LearningKind = 'activity' | 'notebook' | 'experiment' | 'chess-week' | 'chess-puzzle' | 'chess-minigame' | 'chess-bot';
export interface LearningAssignment {
    id: string;
    classId: string;
    title: string;
    description: string;
    kind: LearningKind;
    resourceId: string;
    studentIds: string[];
    dueAt: string | null;
    active: boolean;
}
export interface LearningResult {
    id: string;
    classId: string;
    studentId: string;
    studentName: string;
    assignmentId: string;
    title: string;
    kind: LearningKind;
    status: 'started' | 'completed';
    startedAt?: { toDate: () => Date };
    completedAt?: { toDate: () => Date };
    completionSource?: 'existing-progress' | 'chess-progress' | 'activity-submission' | 'student-report';
    evidence?: { score?: number; best?: number; result?: string; answers?: Record<string, unknown>; submissionId?: string; moves?: number };
}

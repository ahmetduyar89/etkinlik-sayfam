import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
export interface Session { user: User | null; role: 'admin' | 'board' | 'student'; }
export const SessionContext = createContext<Session>({ user: null, role: 'student' });
export const useSession = () => useContext(SessionContext);

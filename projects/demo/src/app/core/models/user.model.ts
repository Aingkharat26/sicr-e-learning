export type UserRole = 'learner' | 'instructor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  thaiName: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  department: string;
  title: string;
  completedCoursesCount: number;
  inProgressCount: number;
  certificatesEarned: number;
  xpPoints: number;
}

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  learner: {
    id: 'usr-001',
    name: 'Aingkharat S.',
    thaiName: 'อิงครัต ศรีทอง',
    email: 'aingkharat@softinterchiangrai.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'learner',
    department: 'Software Engineering',
    title: 'Frontend Developer',
    completedCoursesCount: 4,
    inProgressCount: 2,
    certificatesEarned: 3,
    xpPoints: 1250,
  },
  instructor: {
    id: 'usr-002',
    name: 'Dr. Sarankon P.',
    thaiName: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
    email: 'sarankon.p@softinterchiangrai.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'instructor',
    department: 'Software Engineering & AI',
    title: 'Principal Architect & Senior Instructor',
    completedCoursesCount: 18,
    inProgressCount: 0,
    certificatesEarned: 12,
    xpPoints: 4800,
  },
  admin: {
    id: 'usr-003',
    name: 'Admin SoftInter',
    thaiName: 'ผู้ดูแลระบบ SICR',
    email: 'admin@softinterchiangrai.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    department: 'People Operations & IT Governance',
    title: 'Platform Administrator',
    completedCoursesCount: 25,
    inProgressCount: 0,
    certificatesEarned: 15,
    xpPoints: 9990,
  },
};

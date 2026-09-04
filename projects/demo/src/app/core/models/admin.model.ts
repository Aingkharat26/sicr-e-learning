export interface EmployeeComplianceRecord {
  id: string;
  name: string;
  thaiName: string;
  avatar: string;
  role: string;
  department: string;
  mandatoryCompleted: number;
  mandatoryTotal: number;
  electiveCompleted: number;
  totalXp: number;
  lastActive: string;
  status: 'compliant' | 'in_progress' | 'overdue' | 'not_started';
  assignedCourses: Array<{
    courseId: string;
    courseTitle: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'not_started' | 'overdue';
    dueDate: string;
  }>;
}

export type CoursePublishStatus = 'published' | 'pending_approval' | 'draft' | 'archived';

export interface CourseGovernanceRecord {
  id: string;
  title: string;
  thaiTitle?: string;
  category: string;
  instructorName: string;
  instructorAvatar: string;
  status: CoursePublishStatus;
  totalEnrolled: number;
  completionRate: number;
  rating: number;
  lastUpdated: string;
  isMandatory: boolean;
  xpAward: number;
}

export interface DepartmentComplianceSummary {
  department: string;
  totalEmployees: number;
  compliantEmployees: number;
  complianceRate: number;
  avgXp: number;
  icon: string;
}

export interface AdminKpiMetrics {
  totalLearners: number;
  activeLearnersThisMonth: number;
  overallCompletionRate: number;
  mandatoryComplianceRate: number;
  totalCertificatesIssued: number;
  totalLearningHours: number;
  totalXpDistributed: number;
  pendingCourseApprovals: number;
}

export const MOCK_EMPLOYEES: EmployeeComplianceRecord[] = [
  {
    id: 'SICR-0101',
    name: 'Aingkharat Srithong',
    thaiName: 'อิงครัต ศรีทอง',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Senior Mobile & Frontend Engineer',
    department: 'Software Engineering',
    mandatoryCompleted: 2,
    mandatoryTotal: 2,
    electiveCompleted: 4,
    totalXp: 3850,
    lastActive: 'วันนี้, 09:45 น.',
    status: 'compliant',
    assignedCourses: [
      { courseId: 'crs-001', courseTitle: 'Angular 22 Enterprise Architecture', progress: 100, status: 'completed', dueDate: '15 ส.ค. 2026' },
      { courseId: 'crs-003', courseTitle: 'SICR Employee Onboarding', progress: 100, status: 'completed', dueDate: '01 ส.ค. 2026' },
      { courseId: 'crs-002', courseTitle: 'GenAI & LLM Integration', progress: 75, status: 'in_progress', dueDate: '30 ก.ย. 2026' },
    ],
  },
  {
    id: 'SICR-0102',
    name: 'Tanawat Kiatpaisan',
    thaiName: 'ธนวัฒน์ เกียรติไพศาล',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'Lead Backend Engineer',
    department: 'Software Engineering',
    mandatoryCompleted: 2,
    mandatoryTotal: 2,
    electiveCompleted: 3,
    totalXp: 3100,
    lastActive: 'เมื่อวาน, 16:20 น.',
    status: 'compliant',
    assignedCourses: [
      { courseId: 'crs-001', courseTitle: 'Angular 22 Enterprise Architecture', progress: 100, status: 'completed', dueDate: '15 ส.ค. 2026' },
      { courseId: 'crs-003', courseTitle: 'SICR Employee Onboarding', progress: 100, status: 'completed', dueDate: '01 ส.ค. 2026' },
    ],
  },
  {
    id: 'SICR-0103',
    name: 'Nattapong Suriya',
    thaiName: 'ณัฐพงษ์ สุริยะ',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'QA Lead & Automation Specialist',
    department: 'Quality Assurance',
    mandatoryCompleted: 1,
    mandatoryTotal: 2,
    electiveCompleted: 2,
    totalXp: 2150,
    lastActive: '3 วันที่แล้ว',
    status: 'in_progress',
    assignedCourses: [
      { courseId: 'crs-003', courseTitle: 'SICR Employee Onboarding', progress: 100, status: 'completed', dueDate: '01 ส.ค. 2026' },
      { courseId: 'crs-001', courseTitle: 'Angular 22 Enterprise Architecture', progress: 45, status: 'in_progress', dueDate: '30 ส.ค. 2026' },
    ],
  },
  {
    id: 'SICR-0104',
    name: 'Kanya Rattanakul',
    thaiName: 'กัญญา รัตนกุล',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Product Owner & Business Analyst',
    department: 'Business & Solutions',
    mandatoryCompleted: 1,
    mandatoryTotal: 2,
    electiveCompleted: 1,
    totalXp: 1400,
    lastActive: '5 วันที่แล้ว',
    status: 'overdue',
    assignedCourses: [
      { courseId: 'crs-003', courseTitle: 'SICR Employee Onboarding', progress: 100, status: 'completed', dueDate: '01 ส.ค. 2026' },
      { courseId: 'crs-001', courseTitle: 'Angular 22 Enterprise Architecture', progress: 15, status: 'overdue', dueDate: '10 ส.ค. 2026' },
    ],
  },
  {
    id: 'SICR-0105',
    name: 'Chatchai Wattanakul',
    thaiName: 'ฉัตรชัย วัฒนกุล',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'DevOps & Cloud Architect',
    department: 'Infrastructure & DevOps',
    mandatoryCompleted: 2,
    mandatoryTotal: 2,
    electiveCompleted: 3,
    totalXp: 3450,
    lastActive: 'วันนี้, 08:30 น.',
    status: 'compliant',
    assignedCourses: [
      { courseId: 'crs-001', courseTitle: 'Angular 22 Enterprise Architecture', progress: 100, status: 'completed', dueDate: '15 ส.ค. 2026' },
      { courseId: 'crs-003', courseTitle: 'SICR Employee Onboarding', progress: 100, status: 'completed', dueDate: '01 ส.ค. 2026' },
    ],
  },
  {
    id: 'SICR-0106',
    name: 'Pornthip Dejsombat',
    thaiName: 'พรทิพย์ เดชสมบัติ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'Junior UI/UX Designer',
    department: 'Software Engineering',
    mandatoryCompleted: 0,
    mandatoryTotal: 2,
    electiveCompleted: 0,
    totalXp: 150,
    lastActive: '7 วันที่แล้ว',
    status: 'not_started',
    assignedCourses: [
      { courseId: 'crs-003', courseTitle: 'SICR Employee Onboarding', progress: 20, status: 'in_progress', dueDate: '25 ส.ค. 2026' },
      { courseId: 'crs-001', courseTitle: 'Angular 22 Enterprise Architecture', progress: 0, status: 'not_started', dueDate: '30 ก.ย. 2026' },
    ],
  },
  {
    id: 'SICR-0107',
    name: 'Wichai Ruengrit',
    thaiName: 'วิชัย เรืองฤทธิ์',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'Project Manager & Agile Coach',
    department: 'People & Culture',
    mandatoryCompleted: 2,
    mandatoryTotal: 2,
    electiveCompleted: 2,
    totalXp: 2800,
    lastActive: 'วันนี้, 10:15 น.',
    status: 'compliant',
    assignedCourses: [
      { courseId: 'crs-001', courseTitle: 'Angular 22 Enterprise Architecture', progress: 100, status: 'completed', dueDate: '15 ส.ค. 2026' },
      { courseId: 'crs-003', courseTitle: 'SICR Employee Onboarding', progress: 100, status: 'completed', dueDate: '01 ส.ค. 2026' },
    ],
  },
];

export const MOCK_DEPARTMENT_COMPLIANCE: DepartmentComplianceSummary[] = [
  { department: 'Software Engineering', totalEmployees: 34, compliantEmployees: 30, complianceRate: 88, avgXp: 3200, icon: '💻' },
  { department: 'Infrastructure & DevOps', totalEmployees: 12, compliantEmployees: 11, complianceRate: 92, avgXp: 3100, icon: '☁️' },
  { department: 'Quality Assurance', totalEmployees: 16, compliantEmployees: 13, complianceRate: 81, avgXp: 2450, icon: '🧪' },
  { department: 'Business & Solutions', totalEmployees: 18, compliantEmployees: 14, complianceRate: 78, avgXp: 1950, icon: '📈' },
  { department: 'People & Culture', totalEmployees: 8, compliantEmployees: 8, complianceRate: 100, avgXp: 2600, icon: '🤝' },
];

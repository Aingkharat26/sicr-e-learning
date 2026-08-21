export interface Certificate {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string;
  courseThaiTitle?: string;
  recipientName: string;
  recipientRole: string;
  recipientDepartment: string;
  issueDate: string;
  completionScorePercent: number;
  xpEarned: number;
  duration: string;
  instructorName: string;
  instructorTitle: string;
  ceoName: string;
  ceoTitle: string;
  skillsCovered: string[];
  verificationUrl: string;
}

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-001',
    certificateNumber: 'SICR-CERT-2026-08149',
    courseId: 'crs-003',
    courseTitle: 'SICR Employee Onboarding & Culture Guideline',
    courseThaiTitle: 'ปฐมนิเทศพนักงานใหม่ และวัฒนธรรมการทำงาน Soft Inter Chiangrai',
    recipientName: 'Aingkharat Srithong',
    recipientRole: 'Senior Frontend & Mobile Engineer',
    recipientDepartment: 'Software Engineering & AI',
    issueDate: '15 สิงหาคม 2026',
    completionScorePercent: 96,
    xpEarned: 800,
    duration: '3 ชม. 45 นาที',
    instructorName: 'Admin SoftInter (HR Lead)',
    instructorTitle: 'Platform Administrator & HR Lead',
    ceoName: 'Surapong Kittisrisakul',
    ceoTitle: 'Chief Executive Officer, Soft Inter Chiangrai Co., Ltd.',
    skillsCovered: ['Corporate Culture', 'IT Security Policies', 'Internal Tooling', 'HR Operations'],
    verificationUrl: 'https://verify.softinter.co.th/cert/SICR-CERT-2026-08149',
  },
];

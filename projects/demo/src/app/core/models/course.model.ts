export type CourseCategory =
  | 'Software Engineering'
  | 'AI & Data'
  | 'DevOps & Cloud'
  | 'QA & Testing'
  | 'HR & Onboarding'
  | 'Management';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type EnrollmentStatus = 'not_enrolled' | 'in_progress' | 'completed';

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf' | 'article' | 'quiz';
  videoUrl?: string;
  documentUrl?: string;
  contentMarkdown?: string;
  isCompleted?: boolean;
  quizId?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseInstructor {
  id: string;
  name: string;
  thaiName: string;
  avatar: string;
  title: string;
  department: string;
}

export interface Course {
  id: string;
  title: string;
  thaiTitle?: string;
  slug: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: string;
  totalLessons: number;
  xpAward: number;
  thumbnail: string;
  description: string;
  shortDescription: string;
  instructor: CourseInstructor;
  rating: number;
  ratingCount: number;
  totalEnrolled: number;
  isMandatory?: boolean;
  isFeatured?: boolean;
  tags: string[];
  enrolledStatus: EnrollmentStatus;
  userProgressPercent: number; // 0 - 100
  lastAccessedLessonTitle?: string;
  modules: CourseModule[];
}

export interface CourseFilterOptions {
  searchQuery: string;
  category: CourseCategory | 'All';
  level: CourseLevel | 'All';
  status: EnrollmentStatus | 'All';
  sortBy: 'popular' | 'newest' | 'rating' | 'duration';
  viewMode: 'grid' | 'list';
}

export const MOCK_COURSES: Course[] = [
  {
    id: 'crs-001',
    title: 'Angular 22 Enterprise Architecture & Zoneless Signals',
    thaiTitle: 'สถาปัตยกรรม Angular 22 และ Zoneless Signals สำหรับระบบองค์กร',
    slug: 'angular-22-enterprise-signals',
    category: 'Software Engineering',
    level: 'Intermediate',
    duration: '6 ชม. 30 นาที',
    totalLessons: 12,
    xpAward: 1200,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    description: 'เรียนรู้สถาปัตยกรรม Modern Angular 22 ที่ใช้งานจริงในทีม Soft Inter Chiangrai ตั้งแต่ Signals State Management, Standalone Components, Zoneless Change Detection ไปจนถึงการสร้าง `@sic-ng` Component Library เพื่อส่งมอบคุณภาพสูงสุด',
    shortDescription: 'สร้างระบบ Enterprise Web App ประสิทธิภาพสูงด้วย Angular 22 Zoneless และ Signals State Management',
    instructor: {
      id: 'usr-002',
      name: 'Dr. Sarankon P.',
      thaiName: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      title: 'Principal Architect & Senior Instructor',
      department: 'Software Engineering & AI',
    },
    rating: 4.9,
    ratingCount: 48,
    totalEnrolled: 142,
    isFeatured: true,
    isMandatory: true,
    tags: ['Angular 22', 'Signals', 'Zoneless', 'Frontend', 'TypeScript'],
    enrolledStatus: 'in_progress',
    userProgressPercent: 65,
    lastAccessedLessonTitle: 'บทที่ 4: Advanced Signals & LinkedSignal Pattern',
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: แกนหลัก Angular 22 & Zoneless Revolution',
        order: 1,
        lessons: [
          { id: 'les-101', title: '1.1 บทนำสู่ Angular 22 และการทำงานแบบ Zoneless', duration: '20 นาที', type: 'video', isCompleted: true },
          { id: 'les-102', title: '1.2 Signals vs RxJS: การเลือกใช้งานที่เหมาะสม', duration: '35 นาที', type: 'video', isCompleted: true },
          { id: 'les-103', title: '1.3 แบบทดสอบวัดความเข้าใจ Signals Foundation', duration: '15 นาที', type: 'quiz', isCompleted: true, quizId: 'quiz-001' },
        ],
      },
      {
        id: 'mod-2',
        title: 'โมดูล 2: Design System Integration กับ @sic-ng',
        order: 2,
        lessons: [
          { id: 'les-201', title: '2.1 การนำเข้า Token และ CSS Variable ของ Soft Inter', duration: '25 นาที', type: 'video', isCompleted: true },
          { id: 'les-202', title: '2.2 การสร้าง Custom Control ด้วย SicFormControlBase', duration: '40 นาที', type: 'video', isCompleted: true },
          { id: 'les-203', title: '2.3 เอกสารประกอบ Guideline & Best Practices', duration: '15 นาที', type: 'pdf', isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'crs-002',
    title: 'GenAI & LLM Integration for Enterprise Applications',
    thaiTitle: 'การประยุกต์ใช้ Generative AI และโมเดลภาษาขนาดใหญ่ในระบบงาน',
    slug: 'genai-llm-enterprise-integration',
    category: 'AI & Data',
    level: 'Advanced',
    duration: '8 ชม. 15 นาที',
    totalLessons: 16,
    xpAward: 1800,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    description: 'เจาะลึกเทคนิคการเชื่อมต่อ Large Language Models (Gemini, Claude, OpenAI) เข้ากับโครงสร้างระบบงานองค์กร การทำ RAG (Retrieval-Augmented Generation), Prompt Engineering ขั้นสูง และระบบรักษาความปลอดภัยข้อมูลความลับบริษัท',
    shortDescription: 'สร้างระบบ AI อัจฉริยะด้วย RAG, Vector Search และเชื่อมต่อ Gemini API เพื่อเพิ่มขีดความสามารถองค์กร',
    instructor: {
      id: 'usr-002',
      name: 'Dr. Sarankon P.',
      thaiName: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      title: 'Principal Architect & Senior Instructor',
      department: 'Software Engineering & AI',
    },
    rating: 4.95,
    ratingCount: 62,
    totalEnrolled: 185,
    isFeatured: true,
    isMandatory: false,
    tags: ['GenAI', 'LLM', 'RAG', 'Vector Database', 'Python', 'AI'],
    enrolledStatus: 'in_progress',
    userProgressPercent: 25,
    lastAccessedLessonTitle: 'บทที่ 2: Embeddings & Vector Stores (Qdrant & pgvector)',
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: AI Fundamentals & LLM API Protocol',
        order: 1,
        lessons: [
          { id: 'les-101', title: '1.1 LLM Tokenization, Context Window & Cost Optimization', duration: '30 นาที', type: 'video', isCompleted: true },
          { id: 'les-102', title: '1.2 Structured Outputs & Function Calling', duration: '45 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'crs-003',
    title: 'SICR Employee Onboarding & Culture Guideline',
    thaiTitle: 'ปฐมนิเทศพนักงานใหม่ และวัฒนธรรมการทำงาน Soft Inter Chiangrai',
    slug: 'sicr-employee-onboarding',
    category: 'HR & Onboarding',
    level: 'Beginner',
    duration: '3 ชม. 45 นาที',
    totalLessons: 8,
    xpAward: 800,
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    description: 'หลักสูตรบังคับสำหรับพนักงานใหม่ทุกคน เพื่อเข้าใจวิสัยทัศน์ วัฒนธรรมองค์กร ขั้นตอนการเบิกจ่ายสวัสดิการ กฎระเบียบ IT Security และการใช้งานเครื่องมือสื่อสารภายในบริษัท Soft Inter Chiangrai อย่างมีประสิทธิภาพ',
    shortDescription: 'หลักสูตรปฐมนิเทศพนักงานใหม่ กฎระเบียบ สวัสดิการ วัฒนธรรมการทำงาน และ IT Security',
    instructor: {
      id: 'usr-003',
      name: 'Admin SoftInter',
      thaiName: 'ผู้ดูแลระบบ SICR & ฝ่ายทรัพยากรบุคคล',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      title: 'Platform Administrator & HR Lead',
      department: 'People Operations & IT Governance',
    },
    rating: 4.88,
    ratingCount: 110,
    totalEnrolled: 260,
    isFeatured: false,
    isMandatory: true,
    tags: ['Onboarding', 'HR', 'Culture', 'Security', 'Company Policy'],
    enrolledStatus: 'completed',
    userProgressPercent: 100,
    lastAccessedLessonTitle: 'บทที่ 4: การสอบประเมินผลความเข้าใจปฐมนิเทศ',
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: ยินดีต้อนรับสู่ครอบครัว Soft Inter Chiangrai',
        order: 1,
        lessons: [
          { id: 'les-101', title: '1.1 วิสัยทัศน์ ค่านิยมหลัก และเป้าหมายองค์กร', duration: '25 นาที', type: 'video', isCompleted: true },
          { id: 'les-102', title: '1.2 โครงสร้างฝ่ายและเครื่องมือสื่อสาร (Slack, KM, Jira)', duration: '20 นาที', type: 'video', isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'crs-004',
    title: 'Enterprise Backend with NestJS, Fastify & Microservices',
    thaiTitle: 'พัฒนา Backend ระดับองค์กรด้วย NestJS, Fastify และ Microservices',
    slug: 'nestjs-fastify-microservices',
    category: 'Software Engineering',
    level: 'Advanced',
    duration: '7 ชม. 45 นาที',
    totalLessons: 14,
    xpAward: 1500,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    description: 'เรียนรู้การวางโครงสร้างระบบ Backend ประสิทธิภาพสูงด้วย NestJS + Fastify, การจัดการฐานข้อมูล PostgreSQL ผ่าน Prisma ORM, การสื่อสารแบบ Event-Driven ด้วย RabbitMQ และการรักษาความปลอดภัยด้วย OAuth2 / JWT',
    shortDescription: 'สถาปัตยกรรม Microservices, NestJS, Prisma ORM, Redis Caching และระบบ Authentication ที่ปลอดภัย',
    instructor: {
      id: 'usr-004',
      name: 'Tanawat K.',
      thaiName: 'ธนวัฒน์ เกียรติไพศาล',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      title: 'Lead Backend Engineer',
      department: 'Software Engineering',
    },
    rating: 4.85,
    ratingCount: 39,
    totalEnrolled: 98,
    isFeatured: false,
    isMandatory: false,
    tags: ['NestJS', 'Node.js', 'Microservices', 'PostgreSQL', 'Prisma', 'Backend'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: Architecture Blueprint & Dependency Injection',
        order: 1,
        lessons: [
          { id: 'les-101', title: '1.1 NestJS Modular Architecture & Clean Pattern', duration: '35 นาที', type: 'video', isCompleted: false },
          { id: 'les-102', title: '1.2 DTO Validation, Pipes, and Exception Filters', duration: '30 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'crs-005',
    title: 'Automated Testing & End-to-End QA with Playwright & Cypress',
    thaiTitle: 'การทดสอบอัตโนมัติระดับมืออาชีพด้วย Playwright และ Cypress',
    slug: 'automated-qa-testing-playwright',
    category: 'QA & Testing',
    level: 'Intermediate',
    duration: '5 ชม. 20 นาที',
    totalLessons: 10,
    xpAward: 1100,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    description: 'ยกระดับคุณภาพซอฟต์แวร์ด้วยการเขียน Automated Test ครอบคลุม Unit Test, Integration Test และ E2E Testing ด้วย Playwright ที่รวดเร็ว พร้อมการผสานเข้ากับ GitHub Actions CI/CD Pipeline',
    shortDescription: 'สร้าง Test Suite สำหรับ E2E, Component Testing และสร้าง Automated Report คุณภาพสูง',
    instructor: {
      id: 'usr-005',
      name: 'Nattapong S.',
      thaiName: 'ณัฐพงษ์ สุริยะ',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      title: 'QA Lead & Automation Specialist',
      department: 'Quality Assurance',
    },
    rating: 4.82,
    ratingCount: 31,
    totalEnrolled: 82,
    isFeatured: false,
    isMandatory: false,
    tags: ['QA', 'Playwright', 'Cypress', 'Testing', 'CI/CD', 'Automation'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: QA Best Practices & Playwright Setup',
        order: 1,
        lessons: [
          { id: 'les-101', title: '1.1 การวาง Test Strategy สำหรับระบบ Enterprise', duration: '20 นาที', type: 'video', isCompleted: false },
          { id: 'les-102', title: '1.2 Page Object Model (POM) Design Pattern', duration: '40 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'crs-006',
    title: 'Kubernetes, Docker & CI/CD Pipeline Deployment',
    thaiTitle: 'การจัดการ Container, Kubernetes และระบบ CI/CD สำหรับ Production',
    slug: 'kubernetes-docker-cicd-pipeline',
    category: 'DevOps & Cloud',
    level: 'Advanced',
    duration: '9 ชม. 00 นาที',
    totalLessons: 18,
    xpAward: 1900,
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
    description: 'เรียนรู้การบริหารจัดการ Infrastructure สมัยใหม่ การสร้าง Multi-stage Docker Image, การตั้งค่า Kubernetes Clusters (Deployments, Services, Ingress), Helm Charts, และการทำ GitOps ด้วย ArgoCD',
    shortDescription: 'ดูแลและขยายระบบบน Kubernetes Cluster พร้อมติดตั้งระบบ Monitoring & Logging ด้วย Prometheus/Grafana',
    instructor: {
      id: 'usr-006',
      name: 'Chatchai V.',
      thaiName: 'ฉัตรชัย วัฒนกุล',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      title: 'DevOps & Cloud Architect',
      department: 'Infrastructure & Cloud',
    },
    rating: 4.92,
    ratingCount: 53,
    totalEnrolled: 115,
    isFeatured: true,
    isMandatory: false,
    tags: ['Kubernetes', 'Docker', 'DevOps', 'CI/CD', 'Cloud', 'ArgoCD'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: Container Orchestration Foundation',
        order: 1,
        lessons: [
          { id: 'les-101', title: '1.1 Deep Dive Docker Architecture & Multi-arch Builds', duration: '35 นาที', type: 'video', isCompleted: false },
          { id: 'les-102', title: '1.2 Kubernetes Pods, ReplicaSets, and Deployments', duration: '50 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'crs-007',
    title: 'Cross-Platform Mobile Development with Flutter & SIC Design',
    thaiTitle: 'พัฒนา Mobile App ข้ามแพลตฟอร์มด้วย Flutter และดีไซน์ซิสเต็ม SIC',
    slug: 'flutter-mobile-sic-design',
    category: 'Software Engineering',
    level: 'Intermediate',
    duration: '6 ชม. 10 นาที',
    totalLessons: 12,
    xpAward: 1300,
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    description: 'สร้างแอปพลิเคชันมือถือ iOS และ Android ด้วย Flutter Framework การจัดการ State ด้วย Riverpod/Bloc, การเชื่อมต่อ REST & GraphQL API, และการออกแบบหน้าจอ UI ให้ตรงตามมาตรฐาน Soft Inter Chiangrai',
    shortDescription: 'สร้างแอปพลิเคชันมือถือ iOS & Android ด้วย Flutter พร้อมเชื่อมต่อ API และระบบ Push Notifications',
    instructor: {
      id: 'usr-007',
      name: 'Aingkharat S.',
      thaiName: 'อิงครัต ศรีทอง',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Senior Mobile & Frontend Engineer',
      department: 'Software Engineering',
    },
    rating: 4.78,
    ratingCount: 29,
    totalEnrolled: 74,
    isFeatured: false,
    isMandatory: false,
    tags: ['Flutter', 'Mobile', 'Dart', 'iOS', 'Android', 'UI/UX'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: Flutter Framework & Widget Lifecycle',
        order: 1,
        lessons: [
          { id: 'les-101', title: '1.1 Flutter Ecosystem และการติดตั้งสภาพแวดล้อม', duration: '25 นาที', type: 'video', isCompleted: false },
          { id: 'les-102', title: '1.2 Stateful vs Stateless & Custom Widgets', duration: '35 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'crs-008',
    title: 'Agile Scrum & Technical Project Management for IT Teams',
    thaiTitle: 'การบริหารโครงการซอฟต์แวร์ด้วย Agile Scrum และภาวะผู้นำทางเทคนิค',
    slug: 'agile-scrum-technical-leadership',
    category: 'Management',
    level: 'Beginner',
    duration: '4 ชม. 00 นาที',
    totalLessons: 8,
    xpAward: 950,
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
    description: 'แนวทางการบริหารจัดการโครงการซอฟต์แวร์สมัยใหม่ การทำ Sprint Planning, Backlog Refinement, Daily Standup, Retrospective, และการวิเคราะห์ Velocity เพื่อส่งมอบงานตรงเวลาและมีคุณภาพสูงสุด',
    shortDescription: 'เทคนิคการบริหารทีมพัฒนาซอฟต์แวร์ด้วย Agile Scrum, Jira Workflow และการสื่อสารข้ามสายงาน',
    instructor: {
      id: 'usr-008',
      name: 'Wichai R.',
      thaiName: 'วิชัย รัตนประเสริฐ',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      title: 'Head of Project Delivery & Agile Coach',
      department: 'Project Management',
    },
    rating: 4.86,
    ratingCount: 42,
    totalEnrolled: 125,
    isFeatured: false,
    isMandatory: false,
    tags: ['Agile', 'Scrum', 'Management', 'Leadership', 'Jira', 'Sprint'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: Scrum Ceremonies & Team Dynamics',
        order: 1,
        lessons: [
          { id: 'les-101', title: '1.1 เข้าใจบทบาท Product Owner, Scrum Master & Dev Team', duration: '30 นาที', type: 'video', isCompleted: false },
          { id: 'les-102', title: '1.2 การประเมิน Story Points และการจัดลำดับความสำคัญ', duration: '35 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
  },
];

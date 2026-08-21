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
  isPreviewable?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  description?: string;
  lessons: CourseLesson[];
}

export interface CourseInstructor {
  id: string;
  name: string;
  thaiName: string;
  avatar: string;
  title: string;
  department: string;
  bio?: string;
  totalCourses?: number;
  totalStudents?: number;
  rating?: number;
}

export interface CourseReview {
  id: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  department: string;
  rating: number;
  date: string;
  comment: string;
}

export interface CourseFaq {
  question: string;
  answer: string;
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
  whatYouWillLearn?: string[];
  requirements?: string[];
  targetAudience?: string[];
  certificateAvailable?: boolean;
  language?: string;
  lastUpdated?: string;
  reviews?: CourseReview[];
  faqs?: CourseFaq[];
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
      bio: 'หัวหน้าสถาปนิกซอฟต์แวร์ของ Soft Inter Chiangrai ผู้เชี่ยวชาญด้าน Modern Angular, Cloud-Native Architecture และระบบ Enterprise Microfrontends ประสบการณ์กว่า 15 ปี',
      totalCourses: 5,
      totalStudents: 420,
      rating: 4.95,
    },
    rating: 4.9,
    ratingCount: 48,
    totalEnrolled: 142,
    isFeatured: true,
    isMandatory: true,
    tags: ['Angular 22', 'Signals', 'Zoneless', 'Frontend', 'TypeScript', 'Enterprise'],
    enrolledStatus: 'in_progress',
    userProgressPercent: 65,
    lastAccessedLessonTitle: 'บทที่ 2.2: การสร้าง Custom Control ด้วย SicFormControlBase',
    language: 'ภาษาไทย (Technical English)',
    lastUpdated: 'สิงหาคม 2026',
    certificateAvailable: true,
    whatYouWillLearn: [
      'เข้าใจแกนหลักการทำงานของ Angular 22 และสถาปัตยกรรมแบบ Zoneless เต็มรูปแบบ',
      'ออกแบบ State Management ด้วย Angular Signals (`signal`, `computed`, `effect`, `linkedSignal`)',
      'สร้าง Reusable UI Component Library ด้วย Standalone Components และ CSS Tokens',
      'ทำความเข้าใจการเชื่อมต่อ Form Control เข้ากับ Base Class `SicFormControlBase`',
      'เทคนิคการ Optimize Performance และลดขนาด Bundle Size ระดับ Production',
      'การเขียน Unit Test และ Integration Test สำหรับ Signals Component',
    ],
    requirements: [
      'พื้นฐาน TypeScript และ Modern JavaScript (ES6+)',
      'มีความเข้าใจพื้นฐานเกี่ยวกับ HTML, CSS และหลักการทำงานของ Single Page Application (SPA)',
      'เคยผ่านการใช้งาน Angular หรือ Framework อื่นๆ (React/Vue) มาบ้างเบื้องต้น',
    ],
    targetAudience: [
      'Frontend Developers และ Full-stack Engineers ในทีม Soft Inter Chiangrai',
      'นักพัฒนาที่ต้องการยกระดับทักษะสู่ Modern Angular 22 และ Zoneless Architecture',
      'Technical Leads และ System Architects ที่ต้องการวางมาตรฐาน UI Library ขององค์กร',
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: แกนหลัก Angular 22 & Zoneless Revolution',
        order: 1,
        description: 'ปูพื้นฐานการเปลี่ยนแปลงสำคัญใน Angular 22 และแนวคิด Zoneless Change Detection',
        lessons: [
          { id: 'les-101', title: '1.1 บทนำสู่ Angular 22 และการทำงานแบบ Zoneless', duration: '20 นาที', type: 'video', isCompleted: true, isPreviewable: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 'les-102', title: '1.2 Signals vs RxJS: การเลือกใช้งานที่เหมาะสมในระบบงานจริง', duration: '35 นาที', type: 'video', isCompleted: true, isPreviewable: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { id: 'les-103', title: '1.3 สถาปัตยกรรม Reactive State ด้วย computed() และ effect()', duration: '25 นาที', type: 'video', isCompleted: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 'les-104', title: '1.4 แบบทดสอบวัดความเข้าใจ Signals Foundation', duration: '15 นาที', type: 'quiz', isCompleted: true, quizId: 'quiz-001' },
        ],
      },
      {
        id: 'mod-2',
        title: 'โมดูล 2: Design System Integration กับ @sic-ng',
        order: 2,
        description: 'การนำเข้า Design Tokens และการสร้างคอมโพเนนต์มาตรฐานสำหรับองค์กร',
        lessons: [
          { id: 'les-201', title: '2.1 การนำเข้า Token และ CSS Variable ของ Soft Inter Chiangrai', duration: '25 นาที', type: 'video', isCompleted: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
          { id: 'les-202', title: '2.2 การสร้าง Custom Control ด้วย SicFormControlBase', duration: '40 นาที', type: 'video', isCompleted: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { id: 'les-203', title: '2.3 เอกสารประกอบ Guideline & Best Practices สำหรับ @sic-ng', duration: '15 นาที', type: 'pdf', isCompleted: false, contentMarkdown: '# Guideline & Best Practices สำหรับ @sic-ng\n\n## 1. การตั้งชื่อ Component\n- ใช้ prefix `sic-` สำหรับทุก component\n- ใช้ kebab-case สำหรับ selector\n\n## 2. การใช้ CSS Tokens\n- ใช้ `--sic-color-primary` แทนการกำหนดสีตรง\n- ใช้ `--sic-radius-*` สำหรับ border-radius\n\n## 3. Accessibility\n- ทุก component ต้องรองรับ Keyboard Navigation\n- ใช้ `aria-label` อย่างเหมาะสม\n\n## 4. Performance\n- ใช้ `OnPush` Change Detection Strategy\n- หลีกเลี่ยง `ngOnChanges` เมื่อใช้ Signals ได้' },
          { id: 'les-204', title: '2.4 Workshop: สร้าง Dynamic Filter Bar ด้วย Signals', duration: '45 นาที', type: 'video', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
        ],
      },
      {
        id: 'mod-3',
        title: 'โมดูล 3: Performance Tuning & Production Deployment',
        order: 3,
        description: 'เทคนิคการเพิ่มประสิทธิภาพ Bundle, Lazy Loading และการทดสอบระบบ',
        lessons: [
          { id: 'les-301', title: '3.1 วิเคราะห์ Bundle Size และการใช้ Deferrable Views (@defer)', duration: '30 นาที', type: 'video', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
          { id: 'les-302', title: '3.2 การเขียน Unit Test สำหรับ Zoneless Signals Component', duration: '35 นาที', type: 'video', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
          { id: 'les-303', title: '3.3 การจัดเตรียม CI/CD Pipeline สำหรับเผยแพร่ Library', duration: '20 นาที', type: 'article', isCompleted: false, contentMarkdown: '# การจัดเตรียม CI/CD Pipeline\n\n## ภาพรวม\nการตั้งค่า Continuous Integration และ Continuous Deployment สำหรับ `@sic-ng` Component Library\n\n## ขั้นตอนหลัก\n\n### 1. Build Pipeline\n```yaml\nstages:\n  - lint\n  - test\n  - build\n  - publish\n```\n\n### 2. Quality Gates\n- Unit Test Coverage ≥ 80%\n- Zero lint errors\n- Bundle size check\n\n### 3. Versioning\n- ใช้ Semantic Versioning (SemVer)\n- Auto-tag จาก commit messages\n\n### 4. Publishing\n- Publish ไปยัง Internal NPM Registry\n- Auto-update documentation' },
          { id: 'les-304', title: '3.4 แบบทดสอบประเมินผลรอบสุดท้าย (Final Assessment)', duration: '30 นาที', type: 'quiz', isCompleted: false, quizId: 'quiz-002' },
        ],
      },
    ],
    reviews: [
      {
        id: 'rev-001',
        userName: 'Aingkharat S.',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        userRole: 'Senior Mobile & Frontend Engineer',
        department: 'Software Engineering',
        rating: 5,
        date: '18 ส.ค. 2026',
        comment: 'เนื้อหาเข้มข้นมากครับ อธิบายเรื่อง Zoneless และ LinkedSignal ได้เห็นภาพชัดเจน สามารถนำมาปรับใช้กับโปรเจกต์ของทีมได้ทันที!',
      },
      {
        id: 'rev-002',
        userName: 'Tanawat K.',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        userRole: 'Lead Backend Engineer',
        department: 'Software Engineering',
        rating: 5,
        date: '15 ส.ค. 2026',
        comment: 'ถึงผมจะสาย Backend แต่มาเรียนแล้วเข้าใจการไหลของข้อมูลใน Frontend ยุคใหม่ได้ดีมาก สอนเข้าใจง่าย ตัวอย่างใช้งานจริง',
      },
      {
        id: 'rev-003',
        userName: 'Nattapong S.',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        userRole: 'QA Lead & Automation Specialist',
        department: 'Quality Assurance',
        rating: 4.8,
        date: '10 ส.ค. 2026',
        comment: 'ชอบพาร์ทการทดสอบ Component มากครับ ช่วยให้ทีม QA เขียน Playwright E2E และ Component Testing สอดคล้องกับ Developer ได้ง่ายขึ้น',
      },
    ],
    faqs: [
      {
        question: 'หลักสูตรนี้มีใบประกาศนียบัตร (Certificate) ให้หรือไม่?',
        answer: 'มีครับ เมื่อเรียนครบทุกบทเรียนและทำแบบทดสอบประเมินผลผ่านเกณฑ์ 80% ระบบจะสร้างใบ Certificate ดิจิทัลที่มีรหัสตรวจสอบเฉพาะบุคคลให้ทันที',
      },
      {
        question: 'พนักงานใหม่จำเป็นต้องเรียนหลักสูตรนี้หรือไม่?',
        answer: 'หลักสูตรนี้เป็นคอร์สบังคับ (Mandatory) สำหรับพนักงานสาย Software Engineering และแนะนำเป็นอย่างยิ่งสำหรับทุกฝ่ายที่สนใจเทคโนโลยีเว็บ',
      },
      {
        question: 'สามารถย้อนกลับมาดูซ้ำหลังเรียนจบได้หรือไม่?',
        answer: 'สามารถเข้าดูซ้ำ ทบทวนบทเรียน และดาวน์โหลดเอกสารประกอบการเรียนได้ตลอดอายุการทำงานที่ Soft Inter Chiangrai',
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
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    description: 'เจาะลึกเทคนิคการเชื่อมต่อ Large Language Models (Gemini, Claude, OpenAI) เข้ากับโครงสร้างระบบงานองค์กร การทำ RAG (Retrieval-Augmented Generation), Prompt Engineering ขั้นสูง และระบบรักษาความปลอดภัยข้อมูลความลับบริษัท',
    shortDescription: 'สร้างระบบ AI อัจฉริยะด้วย RAG, Vector Search และเชื่อมต่อ Gemini API เพื่อเพิ่มขีดความสามารถองค์กร',
    instructor: {
      id: 'usr-002',
      name: 'Dr. Sarankon P.',
      thaiName: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      title: 'Principal Architect & Senior Instructor',
      department: 'Software Engineering & AI',
      bio: 'หัวหน้าสถาปนิกซอฟต์แวร์และผู้นำการประยุกต์ใช้ AI ใน Soft Inter Chiangrai ผู้เชี่ยวชาญด้าน LLM Agents, Semantic Search และ Enterprise Knowledge Retrieval',
      totalCourses: 5,
      totalStudents: 420,
      rating: 4.95,
    },
    rating: 4.95,
    ratingCount: 62,
    totalEnrolled: 185,
    isFeatured: true,
    isMandatory: false,
    tags: ['GenAI', 'LLM', 'RAG', 'Vector Database', 'Python', 'AI', 'Gemini'],
    enrolledStatus: 'in_progress',
    userProgressPercent: 25,
    lastAccessedLessonTitle: 'บทที่ 1.2: Structured Outputs & Function Calling',
    language: 'ภาษาไทย (Technical English)',
    lastUpdated: 'สิงหาคม 2026',
    certificateAvailable: true,
    whatYouWillLearn: [
      'เข้าใจหลักการทำงานของ LLMs, Tokenization และการบริหารจัดการ Context Window',
      'ออกแบบระบบ RAG (Retrieval-Augmented Generation) ด้วย Vector Database (Qdrant/pgvector)',
      'การใช้ Gemini API, Claude API และ OpenAI สำหรับงานประมวลผลเอกสารองค์กร',
      'เทคนิค Function Calling, Structured Output และการสร้าง Autonomous Agents',
      'มาตรการความปลอดภัย AI Data Privacy และการป้องกัน Prompt Injection',
    ],
    requirements: [
      'พื้นฐานการเขียนโปรแกรมด้วย Python หรือ TypeScript / Node.js',
      'ความเข้าใจพื้นฐานเกี่ยวกับ REST APIs และฐานข้อมูล',
    ],
    targetAudience: [
      'Software Engineers, Data Engineers และ AI Enthusiasts ในองค์กร',
      'ทีมงานที่ต้องการพัฒนาระบบอัตโนมัติและระบบค้นหาความรู้อัจฉริยะ (KM AI)',
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: AI Fundamentals & LLM API Protocol',
        order: 1,
        description: 'พื้นฐานโมเดลภาษาและการเรียกใช้งาน API อย่างคุ้มค่า',
        lessons: [
          { id: 'les-101', title: '1.1 LLM Tokenization, Context Window & Cost Optimization', duration: '30 นาที', type: 'video', isCompleted: true, isPreviewable: true },
          { id: 'les-102', title: '1.2 Structured Outputs & Function Calling ในระบบงานจริง', duration: '45 นาที', type: 'video', isCompleted: false, isPreviewable: true },
          { id: 'les-103', title: '1.3 แบบทดสอบพื้นฐาน Prompt Engineering', duration: '15 นาที', type: 'quiz', isCompleted: false },
        ],
      },
      {
        id: 'mod-2',
        title: 'โมดูล 2: RAG Architecture & Vector Stores',
        order: 2,
        description: 'การทำระบบดึงข้อมูลอัจฉริยะด้วย Vector Search และ Chunker Strategy',
        lessons: [
          { id: 'les-201', title: '2.1 การแปลงข้อมูลเป็น Embeddings และเทคนิค Document Chunking', duration: '35 นาที', type: 'video', isCompleted: false },
          { id: 'les-202', title: '2.2 ติดตั้งและใช้งาน Vector Database (Qdrant & pgvector)', duration: '40 นาที', type: 'video', isCompleted: false },
          { id: 'les-203', title: '2.3 Workshop: สร้าง AI Chatbot ผู้ช่วยค้นหาเอกสารบริษัท', duration: '60 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
    reviews: [
      {
        id: 'rev-001',
        userName: 'Chatchai V.',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        userRole: 'DevOps & Cloud Architect',
        department: 'Infrastructure & Cloud',
        rating: 5,
        date: '17 ส.ค. 2026',
        comment: 'หลักสูตร RAG ที่ชัดเจนที่สุด เข้าใจการเชื่อมโยงระบบค้นหากับ LLM อย่างเป็นระบบครับ',
      },
    ],
    faqs: [
      {
        question: 'ต้องมีความรู้ด้านคณิตศาสตร์ขั้นสูงหรือ Machine Learning มาก่อนหรือไม่?',
        answer: 'ไม่จำเป็นครับ หลักสูตรเน้นการประยุกต์ใช้งาน (Applied GenAI) ผ่าน API และสถาปัตยกรรมระบบมากกว่าการสร้างโมเดลจากศูนย์',
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
      bio: 'ทีมบริหารงานบุคคลและกำกับดูแลความปลอดภัยสารสนเทศของ Soft Inter Chiangrai มุ่งมั่นสร้างสภาพแวดล้อมการทำงานที่สนับสนุนการเติบโตร่วมกัน',
      totalCourses: 3,
      totalStudents: 310,
      rating: 4.9,
    },
    rating: 4.88,
    ratingCount: 110,
    totalEnrolled: 260,
    isFeatured: false,
    isMandatory: true,
    tags: ['Onboarding', 'HR', 'Culture', 'Security', 'Company Policy'],
    enrolledStatus: 'completed',
    userProgressPercent: 100,
    lastAccessedLessonTitle: 'บทที่ 1.2: โครงสร้างฝ่ายและเครื่องมือสื่อสาร (Slack, KM, Jira)',
    language: 'ภาษาไทย',
    lastUpdated: 'สิงหาคม 2026',
    certificateAvailable: true,
    whatYouWillLearn: [
      'เข้าใจวิสัยทัศน์ พันธกิจ และค่านิยมหลักของ Soft Inter Chiangrai',
      'เรียนรู้ขั้นตอนการเบิกจ่าย สวัสดิการ และการลางานผ่านระบบ HR Portal',
      'ข้อกำหนดด้าน IT Security, รหัสผ่าน และการรักษาความลับข้อมูลลูกค้า',
      'การใช้งานเครื่องมือสื่อสารภายในองค์กร (Slack, Jira, Docmost KM, GitLab)',
    ],
    requirements: [
      'พนักงานใหม่ทุกคนที่เข้าทำงานกับ Soft Inter Chiangrai',
    ],
    targetAudience: [
      'พนักงานใหม่ทุกฝ่าย ทุกตำแหน่ง',
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: ยินดีต้อนรับสู่ครอบครัว Soft Inter Chiangrai',
        order: 1,
        description: 'วิสัยทัศน์ ค่านิยม และเครื่องมือสื่อสารภายในบริษัท',
        lessons: [
          { id: 'les-101', title: '1.1 วิสัยทัศน์ ค่านิยมหลัก และเป้าหมายองค์กร', duration: '25 นาที', type: 'video', isCompleted: true, isPreviewable: true },
          { id: 'les-102', title: '1.2 โครงสร้างฝ่ายและเครื่องมือสื่อสาร (Slack, KM, Jira)', duration: '20 นาที', type: 'video', isCompleted: true, isPreviewable: true },
          { id: 'les-103', title: '1.3 สิทธิประโยชน์ ประกันสุขภาพ และสวัสดิการพนักงาน', duration: '30 นาที', type: 'video', isCompleted: true },
          { id: 'les-104', title: '1.4 คู่มือการทำงานและสวัสดิการฉบับเต็ม (PDF)', duration: '15 นาที', type: 'pdf', isCompleted: true },
        ],
      },
      {
        id: 'mod-2',
        title: 'โมดูล 2: IT Security & การรักษาความลับข้อมูล',
        order: 2,
        description: 'มาตรฐานความปลอดภัยสารสนเทศและนโยบายความเป็นส่วนตัว',
        lessons: [
          { id: 'les-201', title: '2.1 นโยบายความปลอดภัยสารสนเทศ (ISO 27001 & PDPA)', duration: '35 นาที', type: 'video', isCompleted: true },
          { id: 'les-202', title: '2.2 การป้องกัน Phishing และการจัดการบัญชีผู้ใช้งาน', duration: '25 นาที', type: 'video', isCompleted: true },
          { id: 'les-203', title: '2.3 แบบทดสอบประเมินผลความเข้าใจปฐมนิเทศ (Final Quiz)', duration: '20 นาที', type: 'quiz', isCompleted: true, quizId: 'quiz-003' },
        ],
      },
    ],
    reviews: [
      {
        id: 'rev-001',
        userName: 'Aingkharat S.',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        userRole: 'Senior Mobile & Frontend Engineer',
        department: 'Software Engineering',
        rating: 5,
        date: '1 ส.ค. 2026',
        comment: 'กระชับ ได้ใจความ ทำให้เข้าใจขั้นตอนการทำงานและสวัสดิการของบริษัทได้อย่างรวดเร็วครับ',
      },
    ],
    faqs: [
      {
        question: 'ต้องทำแบบทดสอบปฐมนิเทศให้เสร็จภายในกี่วัน?',
        answer: 'พนักงานใหม่ต้องเรียนและทำแบบทดสอบให้เสร็จสิ้นภายใน 14 วันแรกของการเริ่มงานครับ',
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
      bio: 'หัวหน้าทีมวิศวกร Backend ประสบการณ์พัฒนา Distributed Systems, High-Concurrency APIs และ Event-Driven Architecture กว่า 10 ปี',
      totalCourses: 3,
      totalStudents: 220,
      rating: 4.88,
    },
    rating: 4.85,
    ratingCount: 39,
    totalEnrolled: 98,
    isFeatured: false,
    isMandatory: false,
    tags: ['NestJS', 'Node.js', 'Microservices', 'PostgreSQL', 'Prisma', 'Backend'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    language: 'ภาษาไทย (Technical English)',
    lastUpdated: 'สิงหาคม 2026',
    certificateAvailable: true,
    whatYouWillLearn: [
      'ออกแบบสถาปัตยกรรม Modular และ Clean Architecture ด้วย NestJS',
      'เพิ่มความเร็ว API ด้วย Fastify Adapter และการทำ Caching ด้วย Redis',
      'จัดการ Schema และ Migration ด้วย Prisma ORM ร่วมกับ PostgreSQL',
      'การสื่อสารแบบ Asynchronous Microservices ผ่าน Message Broker (RabbitMQ)',
    ],
    requirements: [
      'พื้นฐาน JavaScript / TypeScript และความเข้าใจพื้นฐานเกี่ยวกับ Node.js และ REST APIs',
    ],
    targetAudience: [
      'Backend Engineers และ Full-stack Developers ที่ต้องการสร้าง High-Performance APIs',
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: Architecture Blueprint & Dependency Injection',
        order: 1,
        description: 'การวางโครงสร้างโปรเจกต์และ Dependency Injection ใน NestJS',
        lessons: [
          { id: 'les-101', title: '1.1 NestJS Modular Architecture & Clean Pattern', duration: '35 นาที', type: 'video', isCompleted: false, isPreviewable: true },
          { id: 'les-102', title: '1.2 DTO Validation, Pipes, and Exception Filters', duration: '30 นาที', type: 'video', isCompleted: false, isPreviewable: true },
        ],
      },
    ],
    reviews: [],
    faqs: [],
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
      bio: 'ผู้นำทีมประกันคุณภาพซอฟต์แวร์ ผู้เชี่ยวชาญด้าน Automation Framework, Performance Testing และ CI/CD Quality Gates',
      totalCourses: 2,
      totalStudents: 140,
      rating: 4.85,
    },
    rating: 4.82,
    ratingCount: 31,
    totalEnrolled: 82,
    isFeatured: false,
    isMandatory: false,
    tags: ['QA', 'Playwright', 'Cypress', 'Testing', 'CI/CD', 'Automation'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    language: 'ภาษาไทย (Technical English)',
    lastUpdated: 'สิงหาคม 2026',
    certificateAvailable: true,
    whatYouWillLearn: [
      'วางกลยุทธ์ Test Pyramid และการออกแบบ Test Cases สำหรับระบบ Enterprise',
      'เขียน E2E Test ด้วย Playwright รองรับ Multi-browser และ Mobile Viewport',
      'การใช้ Page Object Model (POM) เพื่อให้ Test Code ดูแลรักษาง่าย',
      'ผสาน Test Automation เข้ากับ GitHub Actions เพื่อตรวจสอบทุก Pull Request อัตโนมัติ',
    ],
    requirements: ['พื้นฐาน JavaScript หรือ TypeScript'],
    targetAudience: ['QA Engineers, Software Testers และ Frontend Developers'],
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: QA Best Practices & Playwright Setup',
        order: 1,
        description: 'การวาง Test Strategy และการติดตั้งสภาพแวดล้อม',
        lessons: [
          { id: 'les-101', title: '1.1 การวาง Test Strategy สำหรับระบบ Enterprise', duration: '20 นาที', type: 'video', isCompleted: false, isPreviewable: true },
          { id: 'les-102', title: '1.2 Page Object Model (POM) Design Pattern', duration: '40 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
    reviews: [],
    faqs: [],
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
      bio: 'ผู้เชี่ยวชาญด้าน Cloud Infrastructure, Kubernetes Orchestration และ GitOps Pipeline ประสบการณ์บริหารระบบ Production สเกลใหญ่',
      totalCourses: 4,
      totalStudents: 290,
      rating: 4.92,
    },
    rating: 4.92,
    ratingCount: 53,
    totalEnrolled: 115,
    isFeatured: true,
    isMandatory: false,
    tags: ['Kubernetes', 'Docker', 'DevOps', 'CI/CD', 'Cloud', 'ArgoCD'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    language: 'ภาษาไทย (Technical English)',
    lastUpdated: 'สิงหาคม 2026',
    certificateAvailable: true,
    whatYouWillLearn: [
      'สร้าง Docker Image ที่มีขนาดเล็กและปลอดภัยด้วย Multi-stage build',
      'ออกแบบและบริหารจัดการ Kubernetes Cluster (Pods, Deployments, Services, Ingress)',
      'การบริหารจัดการ Configuration ด้วย Helm Charts และ Kustomize',
      'การทำ GitOps Continuous Deployment ด้วย ArgoCD',
    ],
    requirements: ['พื้นฐาน Linux Command Line และความเข้าใจด้าน Networking เบื้องต้น'],
    targetAudience: ['DevOps Engineers, SysAdmins, และ Senior Developers'],
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: Container Orchestration Foundation',
        order: 1,
        description: 'แกนหลักการทำงานของ Docker และ Kubernetes',
        lessons: [
          { id: 'les-101', title: '1.1 Deep Dive Docker Architecture & Multi-arch Builds', duration: '35 นาที', type: 'video', isCompleted: false, isPreviewable: true },
          { id: 'les-102', title: '1.2 Kubernetes Pods, ReplicaSets, and Deployments', duration: '50 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
    reviews: [],
    faqs: [],
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
      bio: 'นักพัฒนาแอปพลิเคชันมือถือและเว็บอาวุโส ผู้เชี่ยวชาญด้าน Flutter, Cross-Platform Architecture และ UI/UX Design System',
      totalCourses: 2,
      totalStudents: 160,
      rating: 4.85,
    },
    rating: 4.78,
    ratingCount: 29,
    totalEnrolled: 74,
    isFeatured: false,
    isMandatory: false,
    tags: ['Flutter', 'Mobile', 'Dart', 'iOS', 'Android', 'UI/UX'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    language: 'ภาษาไทย (Technical English)',
    lastUpdated: 'สิงหาคม 2026',
    certificateAvailable: true,
    whatYouWillLearn: [
      'สร้าง Mobile App สำหรับ iOS และ Android จาก Codebase เดียวด้วย Flutter & Dart',
      'การจัดการ State อย่างมีประสิทธิภาพด้วย Riverpod และ Flutter Bloc',
      'การนำแนวคิด Design Tokens ของ Soft Inter Chiangrai มาปรับใช้กับ Flutter Widget',
      'การเชื่อมต่อระบบแจ้งเตือน Push Notification และ Background Services',
    ],
    requirements: ['พื้นฐานการเขียนโปรแกรมเชิงวัตถุ (OOP) หรือภาษา Dart/JavaScript/Java'],
    targetAudience: ['Mobile Developers, Frontend Developers ที่ต้องการสร้าง Mobile App'],
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: Flutter Framework & Widget Lifecycle',
        order: 1,
        description: 'การเริ่มต้นและโครงสร้าง Widget ใน Flutter',
        lessons: [
          { id: 'les-101', title: '1.1 Flutter Ecosystem และการติดตั้งสภาพแวดล้อม', duration: '25 นาที', type: 'video', isCompleted: false, isPreviewable: true },
          { id: 'les-102', title: '1.2 Stateful vs Stateless & Custom Widgets', duration: '35 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
    reviews: [],
    faqs: [],
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
      bio: 'หัวหน้าฝ่ายบริหารโครงการซอฟต์แวร์และโค้ช Agile ประสบการณ์นำทีมพัฒนาและส่งมอบโครงการระดับ Enterprise กว่า 12 ปี',
      totalCourses: 2,
      totalStudents: 190,
      rating: 4.88,
    },
    rating: 4.86,
    ratingCount: 42,
    totalEnrolled: 125,
    isFeatured: false,
    isMandatory: false,
    tags: ['Agile', 'Scrum', 'Management', 'Leadership', 'Jira', 'Sprint'],
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    language: 'ภาษาไทย',
    lastUpdated: 'สิงหาคม 2026',
    certificateAvailable: true,
    whatYouWillLearn: [
      'เข้าใจหัวใจของ Agile Mindset และ Framework การทำงานแบบ Scrum',
      'การจัดประชุม Sprint Planning, Daily Standup, Sprint Review และ Retrospective',
      'การเขียน User Story และการประเมิน Story Points อย่างมีประสิทธิภาพ',
      'การใช้งาน Jira และ Confluence เพื่อติดตามความคืบหน้างาน',
    ],
    requirements: ['ไม่มีข้อกำหนดเบื้องต้น สามารถเรียนได้ทุกฝ่าย'],
    targetAudience: ['Project Managers, Scrum Masters, Tech Leads, และสมาชิกทีมพัฒนา'],
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: Scrum Ceremonies & Team Dynamics',
        order: 1,
        description: 'พิธีกรรมและบทบาทหน้าที่ในทีม Scrum',
        lessons: [
          { id: 'les-101', title: '1.1 เข้าใจบทบาท Product Owner, Scrum Master & Dev Team', duration: '30 นาที', type: 'video', isCompleted: false, isPreviewable: true },
          { id: 'les-102', title: '1.2 การประเมิน Story Points และการจัดลำดับความสำคัญ', duration: '35 นาที', type: 'video', isCompleted: false },
        ],
      },
    ],
    reviews: [],
    faqs: [],
  },
];

import { SicCodeLanguage } from 'sic-ng';

export type KmSpaceId = 'dev' | 'qa' | 'hr' | 'sales' | 'support';

export interface KmSpace {
  id: KmSpaceId;
  name: string;
  thaiName: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  leadName: string;
  leadRole: string;
  leadAvatar: string;
  totalArticles: number;
  totalContributors: number;
  popularTags: string[];
}

export interface KmArticleSection {
  id: string;
  title: string;
  contentMarkdown: string;
  codeSnippet?: {
    language: SicCodeLanguage;
    code: string;
    filename?: string;
  };
  callout?: {
    type: 'note' | 'tip' | 'warning' | 'important';
    title?: string;
    text: string;
  };
}

export interface KmVersionHistory {
  version: string;
  date: string;
  author: string;
  avatarUrl: string;
  changeNote: string;
}

export interface KmAttachment {
  name: string;
  size: string;
  type: string;
  downloadUrl?: string;
}

export interface KmArticle {
  id: string;
  slug: string;
  title: string;
  spaceId: KmSpaceId;
  category: 'Guidelines' | 'Cheat Sheet' | 'Architecture' | 'Setup & Config' | 'Policy' | 'Troubleshooting';
  summary: string;
  readTimeMinutes: number;
  views: number;
  likes: number;
  lastUpdated: string;
  createdDate: string;
  pinned: boolean;
  featured?: boolean;
  author: {
    name: string;
    role: string;
    department: string;
    avatarUrl: string;
  };
  tags: string[];
  sections: KmArticleSection[];
  versionHistory: KmVersionHistory[];
  attachments?: KmAttachment[];
  relatedArticleIds?: string[];
}

export const KM_SPACES: KmSpace[] = [
  {
    id: 'dev',
    name: 'Software Engineering',
    thaiName: 'พัฒนาซอฟต์แวร์ & สถาปัตยกรรม',
    icon: '💻',
    color: '#00a887',
    bgColor: 'rgba(0, 168, 135, 0.12)',
    description: 'มาตรฐานโค้ด, แนวทางการพัฒนา Frontend/Backend, Git Flow, API Specifications และ Design System',
    leadName: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
    leadRole: 'Principal Architect',
    leadAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalArticles: 14,
    totalContributors: 8,
    popularTags: ['Angular', 'TypeScript', 'Clean Code', 'REST API', 'Signals', 'Docker'],
  },
  {
    id: 'qa',
    name: 'QA & Automated Testing',
    thaiName: 'การทดสอบระบบ & ประกันคุณภาพ',
    icon: '🧪',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    description: 'คู่มือการเขียน Automated Tests, Cypress/Playwright Guide, Test Plan Templates และ Bug Severity Matrix',
    leadName: 'กนกวรรณ จันทร์ประเสริฐ',
    leadRole: 'Lead QA Engineer',
    leadAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    totalArticles: 9,
    totalContributors: 5,
    popularTags: ['Playwright', 'Cypress', 'Regression', 'Test Plan', 'Bug Priority'],
  },
  {
    id: 'hr',
    name: 'People & Culture',
    thaiName: 'บุคคลากร & วัฒนธรรมองค์กร',
    icon: '🤝',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    description: 'ระเบียบบริษัท, สวัสดิการพนักงาน, กฎการลา, คู่มือ Onboarding พนักงานใหม่ และเกณฑ์การประเมิน KPI/OKRs',
    leadName: 'มยุรี สุวรรณรัตน์',
    leadRole: 'People & Culture Director',
    leadAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    totalArticles: 12,
    totalContributors: 4,
    popularTags: ['Onboarding', 'Benefits', 'Leave Policy', 'Workplace Culture', 'KPIs'],
  },
  {
    id: 'sales',
    name: 'Solutions & Business Development',
    thaiName: 'โซลูชัน & พัฒนาธุรกิจ',
    icon: '📈',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    description: 'แคตตาล็อกโซลูชันซอฟต์แวร์, แฟ้มนำเสนอลูกค้า (Pitch Decks), โครงสร้างราคา และเทมเพลตข้อเสนอโครงการ (Proposal)',
    leadName: 'ธีรศักดิ์ เมธากุล',
    leadRole: 'Business Solutions VP',
    leadAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    totalArticles: 8,
    totalContributors: 6,
    popularTags: ['Pitch Deck', 'Product Matrix', 'Proposal Template', 'Case Studies'],
  },
  {
    id: 'support',
    name: 'DevOps & IT Infrastructure',
    thaiName: 'โครงสร้างพื้นฐานไอที & ซัพพอร์ต',
    icon: '🛠️',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    description: 'คู่มือการเชื่อมต่อ VPN, นโยบายความปลอดภัยไซเบอร์, การติดตั้ง Dev Environment และขั้นตอนขออุปกรณ์ไอที',
    leadName: 'วิศรุต เกียรติสกุล',
    leadRole: 'Senior DevOps & SysAdmin',
    leadAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    totalArticles: 11,
    totalContributors: 4,
    popularTags: ['VPN Setup', 'Security', 'CI/CD', 'Kubernetes', 'IT Request'],
  },
];

export const KM_ARTICLES: KmArticle[] = [
  {
    id: 'art-001',
    slug: 'angular-zoneless-signals-guidelines',
    title: 'แนวทางการออกแบบ Angular 22 Zoneless Architecture & Signals Best Practices',
    spaceId: 'dev',
    category: 'Architecture',
    summary: 'ข้อกำหนดและระเบียบการใช้งาน Signals, Computed, Effects ร่วมกับ Zoneless Change Detection ในโปรเจกต์ของ Soft Inter Chiangrai เพื่อความเร็วและประสิทธิภาพสูงสุด',
    readTimeMinutes: 8,
    views: 1420,
    likes: 128,
    lastUpdated: '2026-08-15',
    createdDate: '2026-07-10',
    pinned: true,
    featured: true,
    author: {
      name: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
      role: 'Principal Architect',
      department: 'Software Engineering & AI',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Angular', 'Signals', 'Zoneless', 'Performance', 'Architecture'],
    sections: [
      {
        id: 'sec-overview',
        title: '1. บทนำและเป้าหมายการเปลี่ยนผ่านสู่ Zoneless',
        contentMarkdown: 'ใน Angular 22 ระบบ Zoneless Change Detection ได้กลายเป็นมาตรฐานสำหรับแอปพลิเคชัน Enterprise ของบริษัท Soft Inter Chiangrai ช่วยลด Bundle Size ลงกว่า 30% และตัดปัญหา Overhead ของ Zone.js ในการ Intercept ทุก Macro/Micro tasks',
        callout: {
          type: 'important',
          title: 'ข้อกำหนดบังคับสำหรับทุกโปรเจกต์ใหม่',
          text: 'ทุก Library และ Feature ใหม่จะต้องเขียนเป็น Standalone Components และใช้ `provideZonelessChangeDetection()` ใน app.config.ts เสมอ ห้ามนำเข้า Zone.js polyfills'
        }
      },
      {
        id: 'sec-signal-patterns',
        title: '2. กฎการใช้งาน State ด้วย Signals (`signal()`, `computed()`, `linkedSignal()`)',
        contentMarkdown: 'การจัดการ State ภายใน Component ให้ใช้ Signal Primitives โดยยึดหลัก Single Source of Truth และหลีกเลี่ยงการ mutate state โดยตรง',
        codeSnippet: {
          language: 'typescript',
          filename: 'user-profile.component.ts',
          code: `import { Component, signal, computed, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  template: \`
    <div class="profile-card">
      <h3>{{ user().name }} ({{ badge() }})</h3>
      <p>คะแนนสะสม: {{ user().points }} XP</p>
      <button (click)="addPoints(50)">+50 XP</button>
    </div>
  \`
})
export class UserProfileComponent {
  readonly user = signal({ id: '01', name: 'Aingkharat', points: 1200 });

  // Computed Signal จะ re-evaluate เฉพาะเมื่อ user().points เปลี่ยนแปลง
  readonly badge = computed(() => {
    return this.user().points >= 1000 ? '⭐ Gold Member' : '🌱 Rookie';
  });

  addPoints(amount: number) {
    this.user.update(u => ({ ...u, points: u.points + amount }));
  }
}`
        }
      },
      {
        id: 'sec-effects-caution',
        title: '3. ข้อควรระวังในการใช้งาน `effect()`',
        contentMarkdown: 'หลีกเลี่ยงการใช้ `effect()` เพื่อ sync state ระหว่าง signals เนื่องจากอาจเกิด Infinite loops ให้ใช้ `computed()` หรือ `linkedSignal()` แทน ยกเว้นงาน Logging หรือ Sync กับ External DOM APIs',
        callout: {
          type: 'warning',
          title: 'ข้อควรระวัง',
          text: 'ห้ามเรียก `signal.set()` หรือ `signal.update()` ภายใน `effect()` โดยไม่ตั้งค่า `allowSignalWrites: true` และควรตรวจสอบ Flow ของข้อมูลให้รอบคอบ'
        }
      }
    ],
    versionHistory: [
      {
        version: 'v2.1.0',
        date: '2026-08-15',
        author: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        changeNote: 'อัปเดตคำแนะนำการใช้ linkedSignal() และ Resource API ใน Angular 22'
      },
      {
        version: 'v2.0.0',
        date: '2026-07-10',
        author: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        changeNote: 'ร่างเอกสารมาตรฐาน Zoneless Signals ฉบับสมบูรณ์'
      }
    ],
    attachments: [
      { name: 'SICR-Angular-Architecture-Blueprint-2026.pdf', size: '2.4 MB', type: 'PDF' },
      { name: 'signals-cheatsheet-v2.png', size: '640 KB', type: 'Image' }
    ],
    relatedArticleIds: ['art-002', 'art-006']
  },
  {
    id: 'art-002',
    slug: 'git-flow-branching-commit-convention',
    title: 'มาตรฐาน Git Flow & ข้อกำหนดการเขียน Commit Message ภาษาไทย',
    spaceId: 'dev',
    category: 'Guidelines',
    summary: 'ข้อบังคับการแตก Branch (main / dev / feature), การ Pull Request และการเขียน Commit Message เป็นภาษาไทยพร้อม Description รายละเอียดการทำงาน',
    readTimeMinutes: 5,
    views: 980,
    likes: 89,
    lastUpdated: '2026-08-18',
    createdDate: '2026-06-01',
    pinned: true,
    author: {
      name: 'อิงครัต ศรีทอง',
      role: 'Frontend Developer',
      department: 'Software Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Git', 'GitFlow', 'Code Review', 'Standards'],
    sections: [
      {
        id: 'sec-branches',
        title: '1. โครงสร้าง Branching Strategy',
        contentMarkdown: '- **`main`**: สงวนไว้สำหรับ Production Release ที่ผ่านการ Release Sign-off เท่านั้น\n- **`dev`**: Branch หลักสำหรับการผสานงานและทดสอบฟีเจอร์ในสภาพแวดล้อม Staging\n- **`feature/*`**: แตกออกจาก `dev` เมื่อต้องการเริ่มงานย่อย และ Merge กลับผ่าน Pull Request พร้อม Code Review',
        callout: {
          type: 'important',
          title: 'ข้อห้ามเด็ดขาด',
          text: 'ห้าม Push ตรงเข้าสู่ `main` โดยไม่ผ่าน PR และการตรวจสอบ Build Pipeline เป็นอันขาด'
        }
      },
      {
        id: 'sec-commit-rules',
        title: '2. รูปแบบ Commit Message ภาษาไทย',
        contentMarkdown: 'ทุก Commit จะต้องระบุหัวข้อชัดเจน และมี Description แจกแจงสิ่งที่สร้างหรือแก้ไขเสมอ',
        codeSnippet: {
          language: 'bash',
          filename: 'git-commit-example.sh',
          code: `# ตัวอย่างคำสั่ง Commit ที่ถูกต้อง
git commit -m "feat(courses): เพิ่มระบบค้นหาและ Filter หมวดหมู่หลักสูตร" -m "- เพิ่ม Signals state สำหรับ Instant Search และ Filter Chips
- เชื่อมต่อคอมโพเนนต์ CourseCard รองรับ Grid/List View
- ทดสอบ Responsive ทุกขนาดหน้าจอและผ่าน Build 100%"`
        }
      }
    ],
    versionHistory: [
      {
        version: 'v1.3.0',
        date: '2026-08-18',
        author: 'อิงครัต ศรีทอง',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        changeNote: 'ปรับปรุงแนวทางการใส่ Description ภาษาไทยสำหรับทีมพัฒนา'
      }
    ],
    relatedArticleIds: ['art-001']
  },
  {
    id: 'art-003',
    slug: 'playwright-e2e-testing-cookbook',
    title: 'คู่มือเขียน Automated End-to-End Testing ด้วย Playwright & Page Object Model',
    spaceId: 'qa',
    category: 'Guidelines',
    summary: 'รวมสูตรและเทคนิคการเขียน E2E Tests ทดสอบ User Journey บน Angular Web App ด้วย Playwright พร้อมโครงสร้าง Page Object Model',
    readTimeMinutes: 7,
    views: 650,
    likes: 54,
    lastUpdated: '2026-08-12',
    createdDate: '2026-07-20',
    pinned: true,
    author: {
      name: 'กนกวรรณ จันทร์ประเสริฐ',
      role: 'Lead QA Engineer',
      department: 'QA & Automated Testing',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Playwright', 'Testing', 'E2E', 'Automation', 'QA'],
    sections: [
      {
        id: 'sec-playwright-setup',
        title: '1. โครงสร้าง Page Object Pattern',
        contentMarkdown: 'การเขียน E2E Tests ที่ดีควรแยก Selectors และ Actions ออกจาก Test Spec เพื่อให้บำรุงรักษาง่ายเมื่อ UI มีการปรับเปลี่ยน',
        codeSnippet: {
          language: 'typescript',
          filename: 'course-catalog.page.ts',
          code: `import { Page, Locator, expect } from '@playwright/test';

export class CourseCatalogPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly courseCards: Locator;
  readonly enrollButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="ค้นหาหลักสูตร"]');
    this.courseCards = page.locator('.course-card');
    this.enrollButton = page.locator('button:has-text("ลงทะเบียนเรียนฟรี")');
  }

  async goto() {
    await this.page.goto('/courses');
  }

  async searchCourse(title: string) {
    await this.searchInput.fill(title);
    await expect(this.courseCards.first()).toBeVisible();
  }
}`
        }
      }
    ],
    versionHistory: [
      {
        version: 'v1.0.0',
        date: '2026-08-12',
        author: 'กนกวรรณ จันทร์ประเสริฐ',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        changeNote: 'สร้างเอกสารฉบับแรกสำหรับ Playwright E2E testing'
      }
    ],
    attachments: [
      { name: 'Playwright-Best-Practices-SICR.pdf', size: '1.8 MB', type: 'PDF' }
    ]
  },
  {
    id: 'art-004',
    slug: 'employee-benefits-and-leave-policy-2026',
    title: 'คู่มือสวัสดิการพนักงาน ระเบียบการลา และการเบิกจ่ายค่ารักษาพยาบาล (2026)',
    spaceId: 'hr',
    category: 'Policy',
    summary: 'รายละเอียดสิทธิประโยชน์พนักงาน Soft Inter Chiangrai: สิทธิวันลาพักร้อน 15 วัน, ประกันสุขภาพกลุ่ม OPD/IPD, เบี้ยเลี้ยงต่างจังหวัด และทุนพัฒนาทักษะรายปี 20,000 บาท',
    readTimeMinutes: 6,
    views: 2150,
    likes: 310,
    lastUpdated: '2026-08-01',
    createdDate: '2026-01-15',
    pinned: true,
    featured: true,
    author: {
      name: 'มยุรี สุวรรณรัตน์',
      role: 'People & Culture Director',
      department: 'People & Culture',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Benefits', 'Leave Policy', 'HR', 'Insurance', 'Welfare'],
    sections: [
      {
        id: 'sec-leaves',
        title: '1. ประเภทและจำนวนวันลาต่อปี',
        contentMarkdown: '- **ลาพักร้อน (Annual Leave):** 15 วัน/ปี (ผ่านทดลองงานสะสมได้)\n- **ลาป่วย (Sick Leave):** 30 วัน/ปี (เกิน 3 วันต้องมีใบรับรองแพทย์)\n- **ลากิจ (Business Leave):** 6 วัน/ปี (ได้รับค่าจ้าง)\n- **ลาฝึกอบรมและสอบใบรับรอง (Learning Leave):** 5 วัน/ปี โดยไม่หักวันพักร้อน',
        callout: {
          type: 'tip',
          title: 'งบพัฒนาตนเองรายปี (Learning Budget)',
          text: 'พนักงานทุกคนได้รับสิทธิ์งบซื้อหนังสือ สอบ Certificate สากล (AWS, GCP, Scrum, Microsoft) คนละ 20,000 บาทต่อปี'
        }
      },
      {
        id: 'sec-insurance',
        title: '2. ประกันสุขภาพกลุ่มและทันตกรรม',
        contentMarkdown: 'สามารถแสดงบัตรประกันสุขภาพ Virtual Card ในแอปพลิเคชันเพื่อเข้ารับการรักษาแบบไม่ต้องสำรองจ่ายที่โรงพยาบาลในเครือข่ายกว่า 400 แห่งทั่วประเทศ',
      }
    ],
    versionHistory: [
      {
        version: 'v2026.1',
        date: '2026-08-01',
        author: 'มยุรี สุวรรณรัตน์',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        changeNote: 'ปรับเพิ่มงบประมาณ Learning Budget เป็น 20,000 บาท/ปี'
      }
    ],
    attachments: [
      { name: 'SICR-Employee-Handbook-2026.pdf', size: '4.2 MB', type: 'PDF' },
      { name: 'Medical-Claim-Form.xlsx', size: '120 KB', type: 'Excel' }
    ]
  },
  {
    id: 'art-005',
    slug: 'enterprise-solution-pitch-and-proposal-guide',
    title: 'แนวทางการเตรียม Solution Pitch Deck & Template ใบเสนอโครงการภาครัฐ/เอกชน',
    spaceId: 'sales',
    category: 'Guidelines',
    summary: 'โครงสร้างการนำเสนอโซลูชันระบบสารสนเทศ เทคนิคการตอบข้อกำหนด TOR และ Template การคำนวณ Man-Month Cost สำหรับลูกค้าระดับ Enterprise',
    readTimeMinutes: 9,
    views: 430,
    likes: 42,
    lastUpdated: '2026-07-28',
    createdDate: '2026-05-10',
    pinned: false,
    author: {
      name: 'ธีรศักดิ์ เมธากุล',
      role: 'Business Solutions VP',
      department: 'Solutions & Business Development',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Pitch Deck', 'Proposal', 'TOR', 'Sales Strategy', 'Pricing'],
    sections: [
      {
        id: 'sec-deck-structure',
        title: '1. โครงสร้างสไลด์นำเสนอมาตรฐาน 10 แผ่น (Winning Pitch Deck)',
        contentMarkdown: '1. **Executive Summary & Problem Statement** (ปัญหาของลูกค้าและความท้าทาย)\n2. **Proposed Architecture & Solution Overview** (สถาปัตยกรรมระบบที่เราเสนอ)\n3. **Key Differentiators** (จุดเด่นและความเชี่ยวชาญของ Soft Inter Chiangrai)\n4. **Project Roadmap & Milestones** (แผนการส่งมอบ 3-6 เดือน)\n5. **Investment & ROI Projection** (ประมาณการความคุ้มค่า)',
      }
    ],
    versionHistory: [
      {
        version: 'v1.2.0',
        date: '2026-07-28',
        author: 'ธีรศักดิ์ เมธากุล',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        changeNote: 'อัปเดตสไลด์กรณีศึกษาโรงพยาบาลและสถาบันการศึกษา'
      }
    ],
    attachments: [
      { name: 'SICR-Master-Pitch-Deck-2026.pptx', size: '15.6 MB', type: 'PowerPoint' },
      { name: 'Software-Proposal-Template.docx', size: '850 KB', type: 'Word' }
    ]
  },
  {
    id: 'art-006',
    slug: 'corporate-vpn-and-zero-trust-access-guide',
    title: 'คู่มือการติดตั้ง VPN WireGuard และการเข้าถึงเซิร์ฟเวอร์แบบ Zero-Trust Network',
    spaceId: 'support',
    category: 'Setup & Config',
    summary: 'ขั้นตอนการตั้งค่า WireGuard VPN สำหรับ Remote Work, การยืนยันตัวตน 2FA ด้วย Authenticator App และการขอสิทธิ์เข้าถึง Production Database',
    readTimeMinutes: 5,
    views: 1890,
    likes: 215,
    lastUpdated: '2026-08-17',
    createdDate: '2026-02-20',
    pinned: true,
    author: {
      name: 'วิศรุต เกียรติสกุล',
      role: 'Senior DevOps & SysAdmin',
      department: 'DevOps & IT Infrastructure',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['VPN', 'WireGuard', 'Security', '2FA', 'DevOps'],
    sections: [
      {
        id: 'sec-vpn-install',
        title: '1. การติดตั้ง WireGuard Client',
        contentMarkdown: 'ดาวน์โหลด WireGuard Client จากเว็บไซต์ทางการ และนำเข้า Configuration File ที่ได้รับจากฝ่ายไอที (`sicr-remote-[username].conf`)',
        callout: {
          type: 'important',
          title: 'นโยบายความปลอดภัยไซเบอร์',
          text: 'ห้ามแชร์ไฟล์ Configuration หรือ Private Key ให้ผู้อื่นโดยเด็ดขาด หากอุปกรณ์สูญหายต้องแจ้งฝ่ายไอทีเพื่อ Revoke Key ทันที'
        }
      },
      {
        id: 'sec-ssh-bastion',
        title: '2. การเชื่อมต่อเซิร์ฟเวอร์ผ่าน SSH Bastion Host',
        contentMarkdown: 'การเข้าถึง Staging และ Production Clusters ต้องทำผ่าน Bastion Host พร้อมเปิดใช้งาน SSH Key Pair ร่วมกับ MFA Token',
        codeSnippet: {
          language: 'bash',
          filename: '~/.ssh/config',
          code: `Host sicr-bastion
  HostName bastion.internal.softinterchiangrai.com
  User aingkharat
  IdentityFile ~/.ssh/id_ed25519
  Port 2222

Host staging-node-*
  ProxyJump sicr-bastion
  User devops
  IdentityFile ~/.ssh/id_ed25519`
        }
      }
    ],
    versionHistory: [
      {
        version: 'v2.2.0',
        date: '2026-08-17',
        author: 'วิศรุต เกียรติสกุล',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        changeNote: 'อัปเดตนโยบาย Zero-Trust และเพิ่มคำแนะนำ SSH Config'
      }
    ],
    attachments: [
      { name: 'WireGuard-Setup-Guide-macOS-Windows.pdf', size: '1.1 MB', type: 'PDF' }
    ]
  },
  {
    id: 'art-007',
    slug: 'rest-api-naming-convention-and-error-standards',
    title: 'มาตรฐานการออกแบบ REST API, Naming Convention & Error Response Schema',
    spaceId: 'dev',
    category: 'Guidelines',
    summary: 'ข้อตกลงร่วมในการตั้งชื่อ Endpoints, HTTP Status Codes, รูปแบบ JSON Error Envelope และการทำ Pagination ด้วย Cursor-based Metadata',
    readTimeMinutes: 6,
    views: 820,
    likes: 76,
    lastUpdated: '2026-08-10',
    createdDate: '2026-04-12',
    pinned: false,
    author: {
      name: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
      role: 'Principal Architect',
      department: 'Software Engineering & AI',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['REST API', 'Backend', 'JSON', 'Architecture', 'OpenAPI'],
    sections: [
      {
        id: 'sec-api-envelope',
        title: '1. มาตรฐานโครงสร้าง JSON Response Envelope',
        contentMarkdown: 'ทุก API Endpoint ต้องตอบกลับข้อมูลตามโครงสร้างมาตรฐาน เพื่อให้ Frontend และ Mobile Client สามารถ handle ข้อมูลได้อย่างเป็นเอกภาพ',
        codeSnippet: {
          language: 'json',
          filename: 'api-success-response.json',
          code: `{
  "success": true,
  "code": 200,
  "message": "Data retrieved successfully",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 156,
      "totalPages": 8
    }
  },
  "timestamp": "2026-08-21T09:00:00Z"
}`
        }
      }
    ],
    versionHistory: [
      {
        version: 'v1.1.0',
        date: '2026-08-10',
        author: 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        changeNote: 'เพิ่มตัวอย่าง Error Codes 422 Unprocessable Entity'
      }
    ],
    relatedArticleIds: ['art-001']
  },
  {
    id: 'art-008',
    slug: 'bug-severity-and-priority-triage-matrix',
    title: 'เกณฑ์การจัดระดับความรุนแรงของข้อผิดพลาด (Bug Severity & Priority Matrix)',
    spaceId: 'qa',
    category: 'Cheat Sheet',
    summary: 'ตารางประเมินระดับความรุนแรง Blocker, Critical, Major, Minor, Trivial เพื่อจัดลำดับความสำคัญในการแก้ไขและกำหนด SLA ในการตอบสนอง',
    readTimeMinutes: 4,
    views: 520,
    likes: 47,
    lastUpdated: '2026-07-15',
    createdDate: '2026-03-05',
    pinned: false,
    author: {
      name: 'กนกวรรณ จันทร์ประเสริฐ',
      role: 'Lead QA Engineer',
      department: 'QA & Automated Testing',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    tags: ['Bug Triage', 'Severity', 'SLA', 'QA Matrix'],
    sections: [
      {
        id: 'sec-severity-table',
        title: '1. ตารางจำแนกระดับ Bug Severity',
        contentMarkdown: '- **🔴 Blocker (SLA: 2 ชม.):** ระบบหลักล่มทั้งหมด ผู้ใช้ไม่สามารถเข้าสู่ระบบหรือทำธุรกรรมได้\n- **🟠 Critical (SLA: 6 ชม.):** ฟังก์ชันหลักเสียหายอย่างรุนแรง และไม่มีทางเลี่ยง (No Workaround)\n- **🟡 Major (SLA: 24 ชม.):** ฟังก์ชันรองมีข้อผิดพลาด แต่ระบบหลักยังทำงานต่อได้\n- **🟢 Minor (SLA: 3 วัน):** ปัญหาด้าน UI เล็กน้อย หรือคำสะกดผิดที่ไม่มีผลกระทบต่อ Logic',
      }
    ],
    versionHistory: [
      {
        version: 'v1.0.0',
        date: '2026-07-15',
        author: 'กนกวรรณ จันทร์ประเสริฐ',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        changeNote: 'กำหนด SLA ร่วมกับทีม Management'
      }
    ]
  }
];

export type QuestionType = 'single_choice' | 'multi_choice' | 'true_false';

export interface QuizOption {
  id: string;
  label: string; // เช่น 'A', 'B', 'C', 'D'
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  thaiText?: string;
  type: QuestionType;
  codeSnippet?: string;
  codeLanguage?: string;
  options: QuizOption[];
  correctAnswerIds: string[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  thaiTitle?: string;
  description: string;
  timeLimitMinutes: number; // 0 = unlimited
  passingScorePercent: number; // e.g. 80
  xpAward: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  quizId: string;
  courseId: string;
  answers: Record<string, string[]>; // questionId -> selected option ids
  score: number;
  maxScore: number;
  percent: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
}

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-001',
    courseId: 'crs-001',
    lessonId: 'les-104',
    title: 'Signals Foundation & Reactivity Assessment',
    thaiTitle: 'แบบทดสอบวัดความเข้าใจ Signals Foundation และสถาปัตยกรรม Reactivity',
    description: 'ทดสอบความรู้ความเข้าใจเกี่ยวกับการใช้งาน signal(), computed(), effect() และความแตกต่างระหว่าง Signals กับ RxJS ใน Angular 22',
    timeLimitMinutes: 10,
    passingScorePercent: 80,
    xpAward: 250,
    questions: [
      {
        id: 'q1-1',
        type: 'single_choice',
        text: 'ฟังก์ชันใดใน Angular 22 ที่ใช้สำหรับสร้าง Reactive State ตัวแปรพื้นฐานแบบ Writable Signal?',
        options: [
          { id: 'opt-a', label: 'A', text: 'computed()' },
          { id: 'opt-b', label: 'B', text: 'signal()' },
          { id: 'opt-c', label: 'C', text: 'effect()' },
          { id: 'opt-d', label: 'D', text: 'linkedSignal()' },
        ],
        correctAnswerIds: ['opt-b'],
        explanation: '`signal(initialValue)` คือฟังก์ชันพื้นฐานสำหรับสร้าง Writable Signal ที่สามารถอ่านค่าผ่าน `mySignal()` และอัปเดตค่าด้วย `.set()` หรือ `.update()` ได้',
        points: 20,
      },
      {
        id: 'q1-2',
        type: 'single_choice',
        text: 'พิจารณาโค้ดตัวอย่างด้านล่าง เมื่อเรียก count.set(3) ค่าของ doubleCount() จะเป็นเท่าใด?',
        codeSnippet: `const count = signal(2);
const doubleCount = computed(() => count() * 2);
count.set(3);`,
        codeLanguage: 'typescript',
        options: [
          { id: 'opt-a', label: 'A', text: '4' },
          { id: 'opt-b', label: 'B', text: '6' },
          { id: 'opt-c', label: 'C', text: '2' },
          { id: 'opt-d', label: 'D', text: 'undefined จนกว่าจะมีการเรียกฟังก์ชัน trigger' },
        ],
        correctAnswerIds: ['opt-b'],
        explanation: '`computed()` จะคำนวณค่าใหม่อัตโนมัติ (Memoized & Lazy-evaluated) เมื่อ Signal ที่มันพึ่งพา (`count`) มีการเปลี่ยนแปลงค่า ดังนั้นเมื่อ `count` เปลี่ยนเป็น 3 ค่า `doubleCount()` จึงกลายเป็น 6 ทันที',
        points: 20,
      },
      {
        id: 'q1-3',
        type: 'multi_choice',
        text: 'ข้อใดเป็นจริงเกี่ยวกับ `computed()` Signal ใน Angular 22? (เลือกได้มากกว่า 1 ข้อ)',
        options: [
          { id: 'opt-a', label: 'A', text: 'เป็น Read-only Signal ไม่สามารถเรียก .set() หรือ .update() โดยตรงได้' },
          { id: 'opt-b', label: 'B', text: 'มีการทำงานแบบ Lazy Evaluation และจำผลลัพธ์ (Memoization) ไว้ใช้ซ้ำ' },
          { id: 'opt-c', label: 'C', text: 'สามารถเกิด Side Effect เช่น เรียก HTTP Request ภายใน computed() ได้โดยไม่มีข้อห้าม' },
          { id: 'opt-d', label: 'D', text: 'จะ Re-evaluate ก็ต่อเมื่อ Dependency Signals มีการเปลี่ยนค่าจริงเท่านั้น' },
        ],
        correctAnswerIds: ['opt-a', 'opt-b', 'opt-d'],
        explanation: '`computed()` ถูกออกแบบมาให้เป็น Pure Function ห้ามมี Side Effect (ห้ามเรียก API หรือแก้ไข Signal อื่นข้างใน) และเป็น Read-only โดยมีคุณสมบัติ Memoized และ Re-evaluate เมื่อ dependencies เปลี่ยนเท่านั้น',
        points: 20,
      },
      {
        id: 'q1-4',
        type: 'true_false',
        text: 'ใน Angular 22 Zoneless Architecture เรายังจำเป็นต้องพึ่งพา `zone.js` เพื่อให้ UI อัปเดตเมื่อ Signal เปลี่ยนแปลงค่าเสมอ',
        options: [
          { id: 'opt-t', label: 'True', text: 'จริง (True)' },
          { id: 'opt-f', label: 'False', text: 'เท็จ (False)' },
        ],
        correctAnswerIds: ['opt-f'],
        explanation: 'เท็จ (False) เพราะใน Angular 22 โครงสร้างแบบ Zoneless (`provideZonelessChangeDetection()`) อาศัยกลไก Signal Notifications โดยตรงของ Framework ทำให้สามารถตัด `zone.js` ออกได้อย่างสมบูรณ์ ส่งผลให้ Bundle เล็กลงและทำงานเร็วขึ้น',
        points: 20,
      },
      {
        id: 'q1-5',
        type: 'single_choice',
        text: 'หากต้องการสั่งให้โค้ดทำงานเมื่อ Signal เปลี่ยนแปลง (เช่น บันทึก Log หรือเชื่อมต่อ DOM API ภายนอก) ควรใช้ฟังก์ชันใด?',
        options: [
          { id: 'opt-a', label: 'A', text: 'computed()' },
          { id: 'opt-b', label: 'B', text: 'effect()' },
          { id: 'opt-c', label: 'C', text: 'untracked()' },
          { id: 'opt-d', label: 'D', text: 'toSignal()' },
        ],
        correctAnswerIds: ['opt-b'],
        explanation: '`effect()` เป็นฟังก์ชันที่ออกแบบมาสำหรับการรัน Side Effect เมื่อ Signal มีการอัปเดต โดยต้องรันใน Injection Context เช่น ภายใน constructor หรือ field initializer',
        points: 20,
      },
    ],
  },
  {
    id: 'quiz-002',
    courseId: 'crs-001',
    lessonId: 'les-304',
    title: 'Angular 22 Comprehensive Final Assessment',
    thaiTitle: 'แบบทดสอบประเมินผลรอบสุดท้าย: Angular 22 Enterprise Architecture',
    description: 'แบบทดสอบวัดผลรวมทุกโมดูล (Final Exam) เพื่อรับใบประกาศนียบัตรวิชาชีพประจำหลักสูตร Soft Inter Chiangrai เกณฑ์ผ่าน 80%',
    timeLimitMinutes: 20,
    passingScorePercent: 80,
    xpAward: 500,
    questions: [
      {
        id: 'q2-1',
        type: 'single_choice',
        text: 'การเปิดใช้งาน Zoneless Change Detection ใน Angular 22 ต้องกำหนดค่าอย่างไรใน `app.config.ts`?',
        codeSnippet: `export const appConfig: ApplicationConfig = {
  providers: [
    // ???
  ]
};`,
        codeLanguage: 'typescript',
        options: [
          { id: 'opt-a', label: 'A', text: 'provideZonelessChangeDetection()' },
          { id: 'opt-b', label: 'B', text: 'enableZonelessMode(true)' },
          { id: 'opt-c', label: 'C', text: 'provideExperimentalZonelessChangeDetection()' },
          { id: 'opt-d', label: 'D', text: 'provideZoneFreeEnvironment()' },
        ],
        correctAnswerIds: ['opt-a'],
        explanation: 'ใน Angular 22 ฟังก์ชันมาตรฐานที่พร้อมใช้งานคือ `provideZonelessChangeDetection()` ซึ่งกำหนดใน `providers` ของ ApplicationConfig',
        points: 12.5,
      },
      {
        id: 'q2-2',
        type: 'single_choice',
        text: 'Signal ประเภทใดใน Angular 22 ที่ออกแบบมาเพื่อเป็น Writable State ซึ่งค่า Reset/Synchronize ตาม Signal ต้นทางได้?',
        options: [
          { id: 'opt-a', label: 'A', text: 'computed()' },
          { id: 'opt-b', label: 'B', text: 'linkedSignal()' },
          { id: 'opt-c', label: 'C', text: 'model()' },
          { id: 'opt-d', label: 'D', text: 'resource()' },
        ],
        correctAnswerIds: ['opt-b'],
        explanation: '`linkedSignal()` เป็นฟีเจอร์สำคัญใน Modern Angular ที่สร้าง Signal ซึ่งผู้ใช้สามารถเขียนค่าทับได้ แต่จะ Reset หรือคำนวณใหม่ตาม Source Signal ที่ผูกไว้',
        points: 12.5,
      },
      {
        id: 'q2-3',
        type: 'multi_choice',
        text: 'ข้อใดเป็นประโยชน์ของการใช้ `@defer` (Deferrable Views) ใน Angular Template? (เลือกทุกข้อที่ถูกต้อง)',
        options: [
          { id: 'opt-a', label: 'A', text: 'ช่วยลด Initial Bundle Size ทำให้หน้าเว็บโหลดครั้งแรกได้เร็วขึ้น' },
          { id: 'opt-b', label: 'B', text: 'สามารถกำหนดเงื่อนไขการโหลดได้ เช่น on viewport, on interaction, on timer' },
          { id: 'opt-c', label: 'C', text: 'มีบล็อกเสริม `@placeholder`, `@loading`, และ `@error` ให้จัดการ UI ขณะดาวน์โหลด' },
          { id: 'opt-d', label: 'D', text: 'แปลง TypeScript ทั้งหมดเป็น WebAssembly อัตโนมัติ' },
        ],
        correctAnswerIds: ['opt-a', 'opt-b', 'opt-c'],
        explanation: '`@defer` ช่วยแบ่งโค้ดแบบ Lazy Loading ระดับ Component/Template และรองรับ Trigger หลากหลายพร้อม Placeholder, Loading, Error state แต่ไม่มีความเกี่ยวข้องกับการแปลงเป็น WebAssembly',
        points: 12.5,
      },
      {
        id: 'q2-4',
        type: 'single_choice',
        text: 'ใน `@sic-ng` Component Library คลาสแม่ (Base Class) ที่ใช้เป็นรากฐานสำหรับ Form Control เช่น Input, Checkbox, Radio คือคลาสใด?',
        options: [
          { id: 'opt-a', label: 'A', text: 'SicBaseComponent' },
          { id: 'opt-b', label: 'B', text: 'SicFormControlBase<T>' },
          { id: 'opt-c', label: 'C', text: 'SicValueAccessor' },
          { id: 'opt-d', label: 'D', text: 'SicInputPrimitive' },
        ],
        correctAnswerIds: ['opt-b'],
        explanation: '`SicFormControlBase<T>` เป็น Base Class หลักที่จัดการ ControlValueAccessor, Form Validation, Disabled state, Error Messages และ Signals State ให้กับทุก Form Component ใน `@sic-ng`',
        points: 12.5,
      },
      {
        id: 'q2-5',
        type: 'true_false',
        text: 'เมื่อใช้ Signal Inputs (`input()`) ใน Angular Component ค่าที่ได้รับจะมีสถานะเป็น Read-only Signal เสมอ',
        options: [
          { id: 'opt-t', label: 'True', text: 'จริง (True)' },
          { id: 'opt-f', label: 'False', text: 'เท็จ (False)' },
        ],
        correctAnswerIds: ['opt-t'],
        explanation: 'จริง (True) ค่าที่ได้จาก `input()` จะเป็น `InputSignal<T>` ซึ่งเป็น Read-only หากต้องการ two-way binding ที่แก้ไขค่าได้จากภายใน Component จะต้องใช้ `model()` แทน',
        points: 12.5,
      },
      {
        id: 'q2-6',
        type: 'single_choice',
        text: 'คำสั่งใดใช้สำหรับอ่านค่าของ Signal โดยไม่บันทึกเป็น Dependency ใน `computed()` หรือ `effect()`?',
        options: [
          { id: 'opt-a', label: 'A', text: 'peek()' },
          { id: 'opt-b', label: 'B', text: 'untracked(() => mySignal())' },
          { id: 'opt-c', label: 'C', text: 'mySignal.getRawValue()' },
          { id: 'opt-d', label: 'D', text: 'ignoreSignal(mySignal)' },
        ],
        correctAnswerIds: ['opt-b'],
        explanation: '`untracked(fn)` ใช้สำหรับรันโค้ดและอ่านค่า Signal โดยไม่ให้ Reactive Context นั้นติดตาม Signal ดังกล่าวเป็น Dependency',
        points: 12.5,
      },
      {
        id: 'q2-7',
        type: 'single_choice',
        text: 'สีหลักประจำแบรนด์ Soft Inter Chiangrai ใน Design Token ของ `@sic-ng` คือรหัสสีใด?',
        options: [
          { id: 'opt-a', label: 'A', text: '#00a887 (Soft Inter Teal Green)' },
          { id: 'opt-b', label: 'B', text: '#3b82f6 (Sky Blue)' },
          { id: 'opt-c', label: 'C', text: '#ef4444 (Crimson Red)' },
          { id: 'opt-d', label: 'D', text: '#8b5cf6 (Purple Indigo)' },
        ],
        correctAnswerIds: ['opt-a'],
        explanation: 'สีหลัก Primary Brand ของ Soft Inter Chiangrai คือ `#00a887` ซึ่งสะท้อนอัตลักษณ์ความทันสมัยและความมั่นคงขององค์กร',
        points: 12.5,
      },
      {
        id: 'q2-8',
        type: 'multi_choice',
        text: 'แนวทางปฏิบัติที่ดี (Best Practices) ในการเขียน Unit Test สำหรับ Signals Component ใน Angular 22 คือข้อใด?',
        options: [
          { id: 'opt-a', label: 'A', text: 'ใช้ TestBed.flushEffects() เพื่อให้ effect() รันตามคิวจำลอง' },
          { id: 'opt-b', label: 'B', text: 'สามารถอ่านค่าและตรวจสอบ Signal ได้โดยตรงด้วย myComponent.mySignal()' },
          { id: 'opt-c', label: 'C', text: 'ต้องครอบโค้ดทดสอบทั้งหมดด้วย async/await และ sleep(1000) ทุกบรรทัด' },
          { id: 'opt-d', label: 'D', text: 'ทดสอบการแปลง Input -> Computed Output โดยไม่ต้องพึ่งพา fixture.detectChanges() เสมอไป' },
        ],
        correctAnswerIds: ['opt-a', 'opt-b', 'opt-d'],
        explanation: 'Signals สามารถทดสอบแบบ Synchronous Pure Functions ได้โดยตรง และใช้ `TestBed.flushEffects()` เพื่อรัน Effects โดยไม่จำเป็นต้องใส่ sleep() หน่วงเวลา',
        points: 12.5,
      },
    ],
  },
  {
    id: 'quiz-003',
    courseId: 'crs-003',
    lessonId: 'les-203',
    title: 'SICR Onboarding & IT Security Assessment',
    thaiTitle: 'แบบทดสอบประเมินผลความเข้าใจปฐมนิเทศพนักงานใหม่ และ IT Security',
    description: 'แบบทดสอบวัดความเข้าใจนโยบายบริษัท, IT Security, และการใช้อุปกรณ์สารสนเทศของ Soft Inter Chiangrai',
    timeLimitMinutes: 15,
    passingScorePercent: 80,
    xpAward: 200,
    questions: [
      {
        id: 'q3-1',
        type: 'single_choice',
        text: 'เมื่อได้รับอีเมลที่น่าสงสัยและมีลิงก์แนบมาเพื่อขอให้กรอกรหัสผ่านพนักงาน ควรปฏิบัติตามข้อใด?',
        options: [
          { id: 'opt-a', label: 'A', text: 'คลิกลิงก์เพื่อตรวจสอบว่าเป็นหน้าของบริษัทจริงหรือไม่' },
          { id: 'opt-b', label: 'B', text: 'ห้ามคลิกลิงก์ และรายงานอีเมลดังกล่าวไปยังทีม IT Governance ทันที' },
          { id: 'opt-c', label: 'C', text: 'ส่งต่ออีเมลให้เพื่อนร่วมงานทุกคนช่วยกันดู' },
          { id: 'opt-d', label: 'D', text: 'กรอกรหัสผ่านปลอมเพื่อทดสอบระบบ' },
        ],
        correctAnswerIds: ['opt-b'],
        explanation: 'เป็นเหตุการณ์ Phishing Attack ต้องไม่คลิกลิงก์หรือกรอกข้อมูลใดๆ และต้องแจ้งทีม IT Governance หรือ Security ทันทีตามมาตรฐาน ISO 27001',
        points: 20,
      },
      {
        id: 'q3-2',
        type: 'single_choice',
        text: 'แพลตฟอร์มหลักที่ Soft Inter Chiangrai ใช้สำหรับการบันทึกและสืบค้นความรู้ภายในองค์กร (Knowledge Management) คือระบบใด?',
        options: [
          { id: 'opt-a', label: 'A', text: 'SICR KM Space (Docmost Wiki Hub)' },
          { id: 'opt-b', label: 'B', text: 'สมุดโน้ตกระดาษประจำโต๊ะ' },
          { id: 'opt-c', label: 'C', text: 'ส่งข้อความส่วนตัวผ่าน Facebook Messenger' },
          { id: 'opt-d', label: 'D', text: 'ไฟล์ Word บน Desktop ส่วนตัว' },
        ],
        correctAnswerIds: ['opt-a'],
        explanation: 'บริษัทใช้ SICR KM Space (ระบบคลังความรู้องค์กร) สำหรับจัดการเอกสารมาตรฐาน SOP, Guidelines และ Knowledge Sharing',
        points: 20,
      },
      {
        id: 'q3-3',
        type: 'true_false',
        text: 'พนักงานสามารถนำรหัสผ่านของระบบงานบริษัทไปใช้ร่วมกับบัญชีส่วนตัวภายนอกได้หากจำง่ายกว่า',
        options: [
          { id: 'opt-t', label: 'True', text: 'จริง (True)' },
          { id: 'opt-f', label: 'False', text: 'เท็จ (False)' },
        ],
        correctAnswerIds: ['opt-f'],
        explanation: 'เท็จ (False) ตามนโยบายความปลอดภัยสารสนเทศ ห้ามใช้รหัสผ่านของระบบบริษัทซ้ำกับบัญชีภายนอกเด็ดขาด และต้องเปิดใช้งาน Multi-Factor Authentication (MFA)',
        points: 20,
      },
      {
        id: 'q3-4',
        type: 'multi_choice',
        text: 'ช่องทางการสื่อสารและการทำงานอย่างเป็นทางการของบริษัทประกอบด้วยระบบใดบ้าง? (เลือกทุกข้อที่ถูกต้อง)',
        options: [
          { id: 'opt-a', label: 'A', text: 'Slack สำหรับการสื่อสารด่วนและ Channel ประจำฝ่าย' },
          { id: 'opt-b', label: 'B', text: 'Jira สำหรับบริหารจัดการ Task งานและ Sprint Backlog' },
          { id: 'opt-c', label: 'C', text: 'GitLab สำหรับเก็บ Source Code และตรวจทาน Code Review' },
          { id: 'opt-d', label: 'D', text: 'TikTok Live สาธารณะสำหรับแจกจ่ายรหัส API ลูกค้า' },
        ],
        correctAnswerIds: ['opt-a', 'opt-b', 'opt-c'],
        explanation: 'Slack, Jira, และ GitLab คือเครื่องมือมาตรฐานในการทำงานร่วมกันภายในบริษัท',
        points: 20,
      },
      {
        id: 'q3-5',
        type: 'single_choice',
        text: 'พนักงานใหม่ต้องเรียนและทำแบบทดสอบปฐมนิเทศให้เสร็จสิ้นภายในระยะเวลากี่วันหลังจากเริ่มงาน?',
        options: [
          { id: 'opt-a', label: 'A', text: '3 วัน' },
          { id: 'opt-b', label: 'B', text: '14 วัน' },
          { id: 'opt-c', label: 'C', text: '6 เดือน' },
          { id: 'opt-d', label: 'D', text: '1 ปี' },
        ],
        correctAnswerIds: ['opt-b'],
        explanation: 'ตามระเบียบบริษัท พนักงานใหม่ต้องผ่านการปฐมนิเทศและทำแบบทดสอบให้เสร็จสิ้นภายใน 14 วันแรกของการเข้าทำงาน',
        points: 20,
      },
    ],
  },
];

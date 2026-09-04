import { Injectable, computed, signal } from '@angular/core';
import { AiActionLink, AiMessage, AiMode, AiPromptSuggestion } from '../models/ai-assistant.model';

@Injectable({
  providedIn: 'root',
})
export class AiAssistantService {
  readonly isOpen = signal(false);
  readonly currentMode = signal<AiMode>('system');
  readonly isTyping = signal(false);

  private readonly _messages = signal<AiMessage[]>([
    {
      id: 'msg-welcome-system',
      sender: 'assistant',
      content: 'สวัสดีครับ! ผมคือ **SICR AI System Guide** 🧭 ผู้ช่วยแนะนำการใช้งานระบบ SICR E-Learning & KM คุณสามารถสอบถามวิธีใช้งานระบบ เมนูต่างๆ หรือให้ผมพาไปยังหน้าที่ต้องการได้เลยครับ',
      timestamp: this.getFormattedTime(),
      mode: 'system',
      actions: [
        { label: '🎓 ดูหลักสูตรทั้งหมด', url: '/courses', icon: '🔍' },
        { label: '📚 คลังความรู้ KM', url: '/km', icon: '💡' },
      ],
    },
  ]);

  readonly messages = computed(() => this._messages());

  readonly promptSuggestions = computed<AiPromptSuggestion[]>(() => {
    if (this.currentMode() === 'system') {
      return [
        { text: 'ขอใบประกาศนียบัตร PDF ตรงไหน?', mode: 'system', icon: '📜' },
        { text: 'สลับสิทธิ์ผู้สอน/แอดมินยังไง?', mode: 'system', icon: '🛡️' },
        { text: 'วิธีสร้างคอร์สใหม่สำหรับผู้สอน', mode: 'system', icon: '👨‍🏫' },
        { text: 'ค้นหาแนวทางการเขียนโค้ดของบริษัท', mode: 'system', icon: '💡' },
      ];
    } else {
      return [
        { text: 'สรุปจุดเด่นของ Angular 22 Signals ให้หน่อย', mode: 'learning', icon: '⚡' },
        { text: 'สวัสดิการ Learning Budget 20,000 เบิกยังไง?', mode: 'learning', icon: '💰' },
        { text: 'วิธีตั้งค่า VPN WireGuard ของบริษัท', mode: 'learning', icon: '🔒' },
        { text: 'Playwright Testing มี Best Practices อะไรบ้าง?', mode: 'learning', icon: '🧪' },
      ];
    }
  });

  openChat(initialMode?: AiMode): void {
    if (initialMode) {
      this.currentMode.set(initialMode);
    }
    this.isOpen.set(true);
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  toggleChat(): void {
    this.isOpen.update((v) => !v);
  }

  setMode(mode: AiMode): void {
    if (this.currentMode() === mode) return;
    this.currentMode.set(mode);

    // Add mode transition greeting if not present
    const isLearning = mode === 'learning';
    const transitionMsg: AiMessage = {
      id: `msg-mode-${Date.now()}`,
      sender: 'assistant',
      content: isLearning
        ? '🎓 **สลับสู่โหมด AI ติวเตอร์ & คลังความรู้ (Learning & KM Companion)**\nคุณสามารถสอบถามเนื้อหาทางเทคนิค โค้ดตัวอย่าง สรุปบทความ KM หรือขอคำอธิบายบทเรียนได้เต็มที่ครับ!'
        : '🧭 **สลับสู่โหมด AI แนะนำการใช้งานระบบ (System Guide)**\nสอบถามวิธีการใช้งานระบบ ฟังก์ชันแอดมิน การลงทะเบียน หรือทางลัดต่างๆ ได้เลยครับ!',
      timestamp: this.getFormattedTime(),
      mode: mode,
    };
    this._messages.update((msgs) => [...msgs, transitionMsg]);
  }

  clearChat(): void {
    this._messages.set([]);
    this.setMode(this.currentMode());
  }

  sendMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || this.isTyping()) return;

    const mode = this.currentMode();
    const userMsg: AiMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      timestamp: this.getFormattedTime(),
      mode: mode,
    };

    this._messages.update((msgs) => [...msgs, userMsg]);
    this.isTyping.set(true);

    // Simulate realistic AI generation
    setTimeout(() => {
      const response = this.generateAiResponse(trimmed, mode);
      this._messages.update((msgs) => [...msgs, response]);
      this.isTyping.set(false);
    }, 650);
  }

  private generateAiResponse(query: string, mode: AiMode): AiMessage {
    const lower = query.toLowerCase();

    if (mode === 'system') {
      // 1. SYSTEM GUIDE MATCHES
      if (lower.includes('ใบประกาศ') || lower.includes('certificate') || lower.includes('เกียรติบัตร') || lower.includes('pdf')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '📜 **การดาวน์โหลดและพิมพ์ใบประกาศนียบัตร (Certificate):**\n\nเมื่อคุณเรียนจบคอร์ส 100% และสอบแบบทดสอบผ่านเกณฑ์ **80%** ใบประกาศนียบัตรจะถูกสร้างขึ้นอัตโนมัติ!\n\n1. ไปที่เมนู **"การเรียนของฉัน"** (My Learning)\n2. เลือกแท็บ **"🏆 สำเร็จการศึกษา & ประกาศนียบัตร"**\n3. คลิกปุ่ม **"📜 ดูใบประกาศนียบัตร"** เพื่อดูตัวอย่างและกดสั่งพิมพ์ PDF ได้ทันทีครับ',
          timestamp: this.getFormattedTime(),
          mode: 'system',
          actions: [
            { label: '👉 ไปที่การเรียนของฉัน', url: '/my-learning', icon: '🏆' },
          ],
        };
      }

      if (lower.includes('สลับสิทธิ์') || lower.includes('role') || lower.includes('ผู้สอน') || lower.includes('แอดมิน') || lower.includes('instructor') || lower.includes('admin')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '🛡️ **การสลับ Role จำลองในระบบ:**\n\nที่มุมขวาบนของแถบ Header จะมีปุ่ม **Role Switcher** คุณสามารถคลิกเพื่อสลับระหว่าง:\n- 🎒 **Learner (ผู้เรียน):** ดูคอร์ส เข้าเรียน สอบ และรับ Cert\n- 👨‍🏫 **Instructor (ผู้สอน):** เข้าถึง Course Builder และสร้างหลักสูตร\n- 🛡️ **Admin (ผู้ดูแลระบบ):** ดูรายงาน Compliance และอนุมัติหลักสูตร',
          timestamp: this.getFormattedTime(),
          mode: 'system',
          actions: [
            { label: '👉 เปิดศูนย์แอดมิน & สตูดิโอ', url: '/admin', icon: '⚙️' },
          ],
        };
      }

      if (lower.includes('สร้างคอร์ส') || lower.includes('builder') || lower.includes('เพิ่มบทเรียน') || lower.includes('studio')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '👨‍🏫 **การสร้างคอร์สใหม่ด้วย Course Studio (4 ขั้นตอน):**\n\n1. สลับ Role เป็น **Instructor** หรือ **Admin** แล้วไปที่เมนูจัดการคอร์ส\n2. เลือกแท็บ **"สตูดิโอสร้างคอร์ส"** (Course Builder)\n3. ทำตาม 4 ขั้นตอน: กรอกข้อมูลคอร์ส ➔ เพิ่มบทเรียน (วิดีโอ/เอกสาร) ➔ ออกข้อสอบ Quiz ➔ ตรวจทาน Preview แล้วกด Publish ทันที!',
          timestamp: this.getFormattedTime(),
          mode: 'system',
          actions: [
            { label: '👉 เข้าสู่ Course Studio', url: '/admin', icon: '🚀' },
          ],
        };
      }

      if (lower.includes('รายงาน') || lower.includes('csv') || lower.includes('สถิติ') || lower.includes('compliance') || lower.includes('พนักงาน')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '📊 **การดูรายงานและการ Export CSV:**\n\nผู้ดูแลระบบและ HR สามารถตรวจสอบอัตราความสำเร็จ (Compliance Rate %) รายแผนกและรายบุคคลได้ที่หน้า **Admin Governance** พร้อมมีปุ่ม **"📥 Export รายงาน CSV"** สำหรับเปิดใน Excel ทันทีครับ',
          timestamp: this.getFormattedTime(),
          mode: 'system',
          actions: [
            { label: '👉 ไปที่หน้าแอดมิน', url: '/admin', icon: '📊' },
          ],
        };
      }

      if (lower.includes('km') || lower.includes('คลังความรู้') || lower.includes('wiki') || lower.includes('space') || lower.includes('เอกสาร')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '💡 **คลังความรู้องค์กร (SICR KM Spaces):**\n\nระบบรวบรวมมาตรฐานเอกสารไว้ 5 แผนกหลัก: Software Engineering, QA, People & Culture, Business, และ DevOps คุณสามารถใช้กล่อง Instant Search เพื่อค้นหาคำสำคัญ หรือกดปุ่ม Bookmark บทความไว้อ่านภายหลังได้ครับ',
          timestamp: this.getFormattedTime(),
          mode: 'system',
          actions: [
            { label: '👉 สำรวจคลังความรู้ KM', url: '/km', icon: '💡' },
          ],
        };
      }

      // Default System Guide Response
      return {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        content: `🧭 **คำแนะนำจาก SICR System Guide:**\n\nผมเข้าใจว่าคุณกำลังถามเรื่อง *" ${query} "*\n\nคุณสามารถคลิกปุ่มทางลัดด้านล่างเพื่อไปยังส่วนสำคัญของระบบ หรือสลับไปที่โหมด **"🎓 ติวเรื่องที่เรียน & KM"** หากต้องการสอบถามเนื้อหาเชิงวิชาการครับ!`,
        timestamp: this.getFormattedTime(),
        mode: 'system',
        actions: [
          { label: '🎓 สำรวจคอร์สทั้งหมด', url: '/courses', icon: '🔍' },
          { label: '💡 คลังความรู้ KM', url: '/km', icon: '📚' },
          { label: '🛡️ หน้าควบคุมแอดมิน', url: '/admin', icon: '⚙️' },
        ],
      };
    } else {
      // 2. LEARNING & KM TUTOR MATCHES
      if (lower.includes('signal') || lower.includes('angular') || lower.includes('zoneless') || lower.includes('computed') || lower.includes('effect')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '⚡ **Angular 22 Signals Architecture & Reactive State:**\n\nAngular 22 ทำงานแบบ **Zoneless** โดยใช้ Signals เป็นหัวใจหลักในการตรวจจับการเปลี่ยนแปลงอย่างแม่นยำ (Fine-grained reactivity) ข้อดีคือไม่ต้องรัน Change Detection ทั้งต้นไม้ ช่วยให้ประสิทธิภาพสูงสุด:\n\n- `signal(value)`: จัดเก็บ State ตัวแปรพื้นฐาน\n- `computed(() => ...)`: คำนวณ State อัตโนมัติเมื่อค่าต้นทางเปลี่ยน (Memoized)\n- `effect(() => ...)`: Side-effect ตอบสนองการเปลี่ยนแปลง',
          timestamp: this.getFormattedTime(),
          mode: 'learning',
          codeSnippet: {
            language: 'typescript',
            code: `import { signal, computed } from '@angular/core';

// 1. Primary Signal State
const courseProgress = signal(75);

// 2. Derived Computed State
const isCompleted = computed(() => courseProgress() >= 100);
const statusBadge = computed(() => isCompleted() ? 'Passed' : 'In Progress');

console.log(statusBadge()); // 'In Progress'`,
          },
          sources: [
            { title: 'บทความ KM: Angular 22 Signals Deep Dive', url: '/km/km-001', type: 'km' },
            { title: 'คอร์ส: Modern Frontend with Angular 22', url: '/courses/course-001', type: 'course' },
          ],
        };
      }

      if (lower.includes('playwright') || lower.includes('qa') || lower.includes('e2e') || lower.includes('test') || lower.includes('ทดสอบ')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '🧪 **Playwright E2E Testing Best Practices (Soft Inter Chiangrai):**\n\nทีม QA แนะนำมาตรฐานการเขียน E2E Test ดังนี้:\n1. **User-facing Locators:** ใช้ `page.getByRole()`, `page.getByText()` แทน CSS Selector ลึกๆ\n2. **Auto-waiting:** Playwright รอโหลด Element อัตโนมัติ หลีกเลี่ยงการใช้ `page.waitForTimeout()` คงที่\n3. **Page Object Pattern:** แยกโค้ดหน้าจอออกจากชุด Test เพื่อ Reusability',
          timestamp: this.getFormattedTime(),
          mode: 'learning',
          codeSnippet: {
            language: 'typescript',
            code: `import { test, expect } from '@playwright/test';

test('Learner can enroll and take quiz', async ({ page }) => {
  await page.goto('http://localhost:4200/courses');
  await page.getByRole('button', { name: 'ลงทะเบียนเรียนฟรี' }).first().click();
  await expect(page.getByText('ลงทะเบียนสำเร็จ')).toBeVisible();
});`,
          },
          sources: [
            { title: 'บทความ KM: Playwright Testing Cookbook', url: '/km/km-002', type: 'km' },
            { title: 'คอร์ส: Automated E2E Testing with Playwright', url: '/courses/course-004', type: 'course' },
          ],
        };
      }

      if (lower.includes('wireguard') || lower.includes('vpn') || lower.includes('devops') || lower.includes('ssh') || lower.includes('security')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '🔒 **VPN WireGuard & Zero-Trust Security Access:**\n\nสำหรับการเข้าถึง Server และ Database ภายในของ Soft Inter Chiangrai:\n1. ติดตั้ง WireGuard Client บนเครื่องทำงาน\n2. ดาวน์โหลดไฟล์ Config เฉพาะบุคคลจากทีม IT DevOps\n3. เชื่อมต่อ Endpoint: `vpn.softinterchiangrai.com:51820`\n4. ตรวจสอบสิทธิ์ผ่าน Zero-Trust Bastion Host',
          timestamp: this.getFormattedTime(),
          mode: 'learning',
          sources: [
            { title: 'บทความ KM: VPN WireGuard & SSH Setup Guide', url: '/km/km-005', type: 'km' },
            { title: 'คอร์ส: Cloud Infrastructure & Docker Security', url: '/courses/course-005', type: 'course' },
          ],
        };
      }

      if (lower.includes('สวัสดิการ') || lower.includes('budget') || lower.includes('วันลา') || lower.includes('เบิก') || lower.includes('20,000') || lower.includes('เงิน')) {
        return {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: '🤝 **สวัสดิการ Learning Budget 20,000 บาท/ปี (People & Culture):**\n\n- พนักงานประจำทุกคนได้รับงบพัฒนาทักษะ **20,000 บาท/ปี** สำหรับซื้อคอร์ส หนังสือ หรือสอบใบเซอร์ระดับสากล\n- วันลาพักร้อน 10-15 วัน/ปี + วันลาเพื่อการเรียนรู้ (Education Leave) 3 วัน/ปี\n- ยื่นเอกสารใบเสร็จและสรุปความรู้ผ่านระบบ HR Portal ภายใน 30 วันหลังเรียนจบ',
          timestamp: this.getFormattedTime(),
          mode: 'learning',
          sources: [
            { title: 'บทความ KM: คู่มือสวัสดิการพนักงานและ Learning Budget', url: '/km/km-003', type: 'km' },
          ],
        };
      }

      // Default Learning & KM Response
      return {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        content: `🎓 **คำอธิบายจาก SICR Knowledge Tutor:**\n\nเกี่ยวกับคำถาม *" ${query} "*\n\nระบบตรวจพบว่าหัวข้อนี้มีความเกี่ยวข้องกับบทความและหลักสูตรในคลังความรู้ของเรา คุณสามารถอ่านข้อมูลฉบับเต็มและลงเรียนคอร์สที่เกี่ยวข้องเพื่อเจาะลึกได้จากลิงก์ด้านล่างครับ!`,
        timestamp: this.getFormattedTime(),
        mode: 'learning',
        sources: [
          { title: 'สำรวจคลังความรู้ KM Spaces ทั้งหมด', url: '/km', type: 'km' },
          { title: 'แคตตาล็อกหลักสูตรฝึกอบรม', url: '/courses', type: 'course' },
        ],
      };
    }
  }

  private getFormattedTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }
}

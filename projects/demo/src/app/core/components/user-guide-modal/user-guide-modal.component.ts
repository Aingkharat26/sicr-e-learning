import { Component, HostListener, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGuideService, UserGuideTab } from '../../services/user-guide.service';

@Component({
  selector: 'app-user-guide-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="guide-backdrop" (click)="close()">
        <div class="guide-modal-container" (click)="$event.stopPropagation()">
          <!-- 1. Modal Header -->
          <div class="modal-header">
            <div class="header-title-group">
              <div class="header-icon-badge">📖</div>
              <div>
                <h2 class="header-title">คู่มือการใช้งานระบบ SICR E-LEARNING & KM</h2>
                <p class="header-subtitle">
                  คู่มือสรุปวิธีใช้งานระบบสำหรับพนักงาน Soft Inter Chiangrai ทุกบทบาท
                </p>
              </div>
            </div>
            <button
              type="button"
              class="close-btn"
              (click)="close()"
              title="ปิดหน้าต่าง (Esc)"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <!-- 2. Guide Navigation Tabs -->
          <div class="guide-tabs-bar">
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'learner'"
              (click)="setTab('learner')"
            >
              <span class="tab-icon">🎒</span>
              <span class="tab-label">สำหรับผู้เรียน (Learner)</span>
            </button>

            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'instructor'"
              (click)="setTab('instructor')"
            >
              <span class="tab-icon">👨‍🏫</span>
              <span class="tab-label">สำหรับผู้สอน (Instructor)</span>
            </button>

            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'admin'"
              (click)="setTab('admin')"
            >
              <span class="tab-icon">🛡️</span>
              <span class="tab-label">สำหรับแอดมิน (Admin)</span>
            </button>

            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'km'"
              (click)="setTab('km')"
            >
              <span class="tab-icon">💡</span>
              <span class="tab-label">คลังความรู้ (KM Wiki)</span>
            </button>

            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'shortcuts'"
              (click)="setTab('shortcuts')"
            >
              <span class="tab-icon">⚡</span>
              <span class="tab-label">ฟีเจอร์เด่น & ทางลัด</span>
            </button>
          </div>

          <!-- 3. Modal Body Content -->
          <div class="modal-body">
            <!-- TAB 1: LEARNER GUIDE -->
            @if (activeTab() === 'learner') {
              <div class="guide-tab-content">
                <div class="intro-callout info">
                  <div class="callout-icon">💡</div>
                  <div class="callout-text">
                    <strong>เป้าหมายของผู้เรียน:</strong> สะสมทักษะความรู้ใหม่ๆ ผ่านหลักสูตรออนไลน์, ทำแบบทดสอบให้ผ่านเกณฑ์ 80%, และรับใบประกาศนียบัตรดิจิทัลมาตรฐาน Soft Inter Chiangrai
                  </div>
                </div>

                <div class="workflow-steps">
                  <div class="step-card">
                    <div class="step-badge">ขั้นตอนที่ 1</div>
                    <h3 class="step-title">🔎 ค้นหาและลงทะเบียนคอร์สเรียน</h3>
                    <p class="step-desc">
                      เข้าไปที่หน้า <strong>"หลักสูตรทั้งหมด"</strong> ใช้แถบตัวกรองหมวดหมู่ (Frontend, Backend, AI, QA, DevOps) หรือค้นหาด้วยคีย์เวิร์ด จากนั้นกดปุ่ม <em>"ลงทะเบียนเรียนฟรี"</em>
                    </p>
                  </div>

                  <div class="step-card">
                    <div class="step-badge">ขั้นตอนที่ 2</div>
                    <h3 class="step-title">🎥 เข้าห้องเรียนออนไลน์ (Classroom Player)</h3>
                    <p class="step-desc">
                      รับชมวิดีโอบทเรียนที่มีความคมชัดระดับ HD พร้อมฟังก์ชัน Playlist ด้านข้าง, ระบบจดบันทึกส่วนตัว (Notes) และปุ่มดาวน์โหลดเอกสารประกอบการเรียน
                    </p>
                  </div>

                  <div class="step-card">
                    <div class="step-badge">ขั้นตอนที่ 3</div>
                    <h3 class="step-title">📝 ทำแบบทดสอบท้ายบท (Quiz & Assessment)</h3>
                    <p class="step-desc">
                      เมื่อเรียนจบบทเรียน ให้กดเข้าทำแบบทดสอบ (Multiple Choice / True-False) โดยต้องได้คะแนน <strong>80% ขึ้นไป</strong> ถึงจะถือว่าสอบผ่าน (มีระบบจับเวลาและเฉลยละเอียด)
                    </p>
                  </div>

                  <div class="step-card">
                    <div class="step-badge">ขั้นตอนที่ 4</div>
                    <h3 class="step-title">🏆 รับใบประกาศนียบัตรดิจิทัล (Certificate)</h3>
                    <p class="step-desc">
                      เมื่อเรียนครบ 100% และสอบผ่าน ระบบจะออกใบประกาศนียบัตรพร้อม QR Code ตรวจสอบสิทธิ์ สามารถกดดูในหน้า <strong>"การเรียนของฉัน"</strong> และสั่งพิมพ์ PDF ได้ทันที
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 2: INSTRUCTOR GUIDE -->
            @if (activeTab() === 'instructor') {
              <div class="guide-tab-content">
                <div class="intro-callout primary">
                  <div class="callout-icon">👨‍🏫</div>
                  <div class="callout-text">
                    <strong>Course Studio สำหรับผู้สอน:</strong> สตูดิโอออกแบบหลักสูตรแบบ 4 ขั้นตอน ช่วยให้ผู้สอนสามารถสร้างคอร์สและบทเรียนได้อย่างรวดเร็ว
                  </div>
                </div>

                <div class="workflow-steps">
                  <div class="step-card">
                    <div class="step-badge">Step 1: ข้อมูลคอร์ส</div>
                    <h3 class="step-title">📋 ระบุรายละเอียดและตั้งค่าหลักสูตร</h3>
                    <p class="step-desc">
                      กรอกชื่อคอร์ส, หมวดหมู่, ระดับความยาก (Beginner/Intermediate/Advanced), แต้ม XP ที่จะมอบให้, คอร์สบังคับ (Mandatory) และเลือกภาพปกสวยงามจาก Preset Gallery
                    </p>
                  </div>

                  <div class="step-card">
                    <div class="step-badge">Step 2: โครงสร้างบทเรียน</div>
                    <h3 class="step-title">📚 เพิ่ม Modules & Lessons</h3>
                    <p class="step-desc">
                      จัดหมวดหมู่โมดูล และเพิ่มบทเรียนได้หลากรูปแบบ: วิดีโอ YouTube/MP4, เอกสาร Markdown Reader, และแบบทดสอบ Quiz
                    </p>
                  </div>

                  <div class="step-card">
                    <div class="step-badge">Step 3: แบบทดสอบ</div>
                    <h3 class="step-title">🧪 สร้างข้อสอบและเกณฑ์ประเมิน</h3>
                    <p class="step-desc">
                      ตั้งคำถาม, ช้อยส์คำตอบ, ระบุตัวเลือกที่ถูกต้องพร้อมคำอธิบายเฉลย (Explanation) และกำหนดเกณฑ์ผ่าน % กับเวลาสอบ
                    </p>
                  </div>

                  <div class="step-card">
                    <div class="step-badge">Step 4: ตรวจทาน & เผยแพร่</div>
                    <h3 class="step-title">🚀 Preview & Instant Publish</h3>
                    <p class="step-desc">
                      ตรวจดู Card Preview เสมือนจริง และสรุปจำนวนบทเรียน จากนั้นกดบันทึกเป็น Draft หรือคลิก "🚀 เผยแพร่หลักสูตรทันที" เพื่อให้ปรากฏในแคตตาล็อก
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 3: ADMIN GOVERNANCE GUIDE -->
            @if (activeTab() === 'admin') {
              <div class="guide-tab-content">
                <div class="intro-callout alert">
                  <div class="callout-icon">🛡️</div>
                  <div class="callout-text">
                    <strong>ศูนย์ควบคุมและกำกับดูแลองค์กร:</strong> แดชบอร์ดติดตามอัตราการเรียนรู้ของพนักงาน Soft Inter Chiangrai, การปฏิบัติตามเกณฑ์บังคับ (Compliance), และจัดการหลักสูตร
                  </div>
                </div>

                <div class="admin-features-grid">
                  <div class="feature-box">
                    <div class="box-header">
                      <span class="box-icon">📊</span>
                      <h3 class="box-title">Analytics & KPI Metrics</h3>
                    </div>
                    <p class="box-desc">
                      ติดตามจำนวนผู้เรียนทั้งหมด, อัตราผ่านหลักสูตรบังคับ (Mandatory Compliance Rate %), ชั่วโมงการเรียนรู้รวม และเหรียญรางวัล XP
                    </p>
                  </div>

                  <div class="feature-box">
                    <div class="box-header">
                      <span class="box-icon">👥</span>
                      <h3 class="box-title">Department Compliance Matrix</h3>
                    </div>
                    <p class="box-desc">
                      ตรวจสอบความคืบหน้ารายแผนก (Traffic Light System เขียว/เหลือง/แดง) ค้นหารายบุคคล และส่งข้อความเตือนไปยัง Slack/Email
                    </p>
                  </div>

                  <div class="feature-box">
                    <div class="box-header">
                      <span class="box-icon">📥</span>
                      <h3 class="box-title">Export Compliance CSV</h3>
                    </div>
                    <p class="box-desc">
                      ดาวน์โหลดรายงานข้อมูลสรุปสถิติผู้เรียนออกมาเป็นไฟล์ CSV (UTF-8 BOM) รองรับเปิดใน Microsoft Excel และ Google Sheets
                    </p>
                  </div>

                  <div class="feature-box">
                    <div class="box-header">
                      <span class="box-icon">🏛️</span>
                      <h3 class="box-title">Course Governance & Approvals</h3>
                    </div>
                    <p class="box-desc">
                      ตรวจสอบคอร์สที่รอการอนุมัติ (Pending Approval), เผยแพร่คอร์สใหม่ (Publish), จัดเก็บคอร์สเก่าเข้าคลัง (Archive) หรือกู้คืน
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 4: KM WIKI GUIDE -->
            @if (activeTab() === 'km') {
              <div class="guide-tab-content">
                <div class="intro-callout success">
                  <div class="callout-icon">💡</div>
                  <div class="callout-text">
                    <strong>SICR Knowledge Base (KM):</strong> แหล่งรวมความรู้ มาตรฐานการเขียนโค้ด คู่มือการทำงาน และสวัสดิการของ Soft Inter Chiangrai
                  </div>
                </div>

                <div class="km-guide-layout">
                  <div class="guide-card">
                    <h3 class="card-title">🏢 5 หมวดหมู่แผนกหลัก (Department Spaces)</h3>
                    <ul class="styled-list">
                      <li><strong>Software Engineering:</strong> สถาปัตยกรรม Signals, Git Flow, API Design Standards</li>
                      <li><strong>QA & Automated Testing:</strong> คู่มือ Playwright E2E, Bug Severity Matrix</li>
                      <li><strong>People & Culture:</strong> สวัสดิการ, นโยบายวันลา, Learning Budget 20,000 บาท</li>
                      <li><strong>Solutions & Business:</strong> Proposal Templates, Solution Architecture Pitch</li>
                      <li><strong>Infrastructure & DevOps:</strong> การเชื่อมต่อ VPN WireGuard, Zero-Trust Security</li>
                    </ul>
                  </div>

                  <div class="guide-card">
                    <h3 class="card-title">✍️ ฟีเจอร์เอกสารและเครื่องมือสนับสนุน</h3>
                    <ul class="styled-list">
                      <li><strong>Instant Search:</strong> ค้นหาหัวข้อ แท็ก สรุปเนื้อหา และโค้ดได้แบบ Real-time</li>
                      <li><strong>Interactive Code Viewer:</strong> ไฮไลต์ Syntax โค้ด พร้อมปุ่ม One-click Copy</li>
                      <li><strong>Version History Timeline:</strong> ตรวจสอบประวัติการปรับปรุงเอกสารย้อนหลัง</li>
                      <li><strong>Bookmark & Likes:</strong> บันทึกบทความที่สนใจไว้อ่านซ้ำ และให้คะแนนความพึงพอใจ</li>
                    </ul>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 5: SHORTCUTS & FEATURES -->
            @if (activeTab() === 'shortcuts') {
              <div class="guide-tab-content">
                <div class="shortcuts-table-container">
                  <table class="shortcuts-table">
                    <thead>
                      <tr>
                        <th style="width: 25%;">ฟังก์ชัน / ทางลัด</th>
                        <th style="width: 45%;">คำอธิบายการทำงาน</th>
                        <th style="width: 30%;">ตำแหน่งในหน้าจอ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span class="role-badge learner">Role Switcher</span>
                        </td>
                        <td>สลับมุมมองจำลองระหว่าง <strong>Learner / Instructor / Admin</strong> เพื่อทดสอบระบบได้ทันทีโดยไม่ต้อง Login ใหม่</td>
                        <td>แถบบนสุดขวามือ (Header)</td>
                      </tr>
                      <tr>
                        <td>
                          <span class="role-badge darkmode">🌙 / ☀️ Dark Mode</span>
                        </td>
                        <td>สลับชุดธีมสีมืดและสว่างอย่างสมูท พร้อมปรับโทนสีคอมโพเนนต์ทั้งหมด</td>
                        <td>ปุ่มไอคอนพระจันทร์/พระอาทิตย์ที่ Header</td>
                      </tr>
                      <tr>
                        <td>
                          <span class="role-badge streak">🔥 Active Streak</span>
                        </td>
                        <td>แสดงสถิติการเรียนรู้ต่อเนื่องประจำสัปดาห์ (จันทร์ - อาทิตย์)</td>
                        <td>หน้าแรก Dashboard</td>
                      </tr>
                      <tr>
                        <td>
                          <span class="role-badge cert">🖨️ Print Certificate</span>
                        </td>
                        <td>พิมพ์หรือบันทึกใบประกาศนียบัตรเป็น PDF มาตรฐานแนวนอน A4</td>
                        <td>Modal ใบประกาศนียบัตร</td>
                      </tr>
                      <tr>
                        <td>
                          <span class="role-badge csv">📥 Export CSV</span>
                        </td>
                        <td>ดาวน์โหลดรายงานข้อมูลผู้เรียนและ Compliance สรุปรายแผนก</td>
                        <td>หน้าแอดมิน (Admin Governance)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>

          <!-- 4. Modal Footer -->
          <div class="modal-footer">
            <div class="footer-note">
              <span>🌟 พัฒนาด้วย Angular 22 Zoneless Signals & @sic-ng Component Library</span>
            </div>
            <button type="button" class="btn-primary" (click)="close()">
              เข้าใจแล้ว ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .guide-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(6px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .guide-modal-container {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Modal Header */
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: var(--sic-color-surface, #f8fafc);
    }

    .header-title-group {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .header-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #00a887 0%, #007965 100%);
      color: #ffffff;
      font-size: 1.35rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.3);
      flex-shrink: 0;
    }

    .header-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.15rem 0;
    }

    .header-subtitle {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-bg, #ffffff);
      color: var(--sic-color-text-muted, #64748b);
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }

    /* Tabs Bar */
    .guide-tabs-bar {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.6rem 1.5rem;
      background: var(--sic-color-bg, #ffffff);
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      overflow-x: auto;
      white-space: nowrap;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.85rem;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--sic-color-text-muted, #64748b);
      font-size: 0.84rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .tab-btn:hover {
      background: var(--sic-color-surface, #f8fafc);
      color: var(--sic-color-text, #1e293b);
    }

    .tab-btn.active {
      background: rgba(0, 168, 135, 0.12);
      border-color: rgba(0, 168, 135, 0.3);
      color: #00a887;
      font-weight: 700;
    }

    .tab-icon {
      font-size: 1.05rem;
    }

    /* Modal Body */
    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .intro-callout {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.9rem 1.1rem;
      border-radius: 12px;
      font-size: 0.88rem;
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }

    .intro-callout.info {
      background: rgba(14, 165, 233, 0.1);
      border: 1px solid rgba(14, 165, 233, 0.25);
      color: #0369a1;
    }

    .intro-callout.primary {
      background: rgba(0, 168, 135, 0.1);
      border: 1px solid rgba(0, 168, 135, 0.25);
      color: #007965;
    }

    .intro-callout.alert {
      background: rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.25);
      color: #6d28d9;
    }

    .intro-callout.success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #047857;
    }

    .callout-icon {
      font-size: 1.25rem;
      line-height: 1;
      flex-shrink: 0;
    }

    /* Steps Grid */
    .workflow-steps {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .step-card {
      background: var(--sic-color-surface, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .step-badge {
      font-size: 0.68rem;
      font-weight: 800;
      color: #00a887;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .step-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0;
    }

    .step-desc {
      font-size: 0.82rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.5;
      margin: 0;
    }

    /* Admin Features Grid */
    .admin-features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .feature-box {
      background: var(--sic-color-surface, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .box-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .box-icon {
      font-size: 1.25rem;
    }

    .box-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0;
    }

    .box-desc {
      font-size: 0.82rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.5;
      margin: 0;
    }

    /* KM Guide */
    .km-guide-layout {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .guide-card {
      background: var(--sic-color-surface, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 1.1rem;
    }

    .card-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.75rem 0;
    }

    .styled-list {
      margin: 0;
      padding-left: 1.2rem;
      font-size: 0.82rem;
      color: var(--sic-color-text-muted, #64748b);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      line-height: 1.45;
    }

    /* Shortcuts Table */
    .shortcuts-table-container {
      overflow-x: auto;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
    }

    .shortcuts-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.84rem;
      text-align: left;
    }

    .shortcuts-table th {
      background: var(--sic-color-surface, #f8fafc);
      padding: 0.75rem 1rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .shortcuts-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      color: var(--sic-color-text, #1e293b);
      vertical-align: middle;
    }

    .shortcuts-table tr:last-child td {
      border-bottom: none;
    }

    .role-badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.75rem;
      white-space: nowrap;
    }

    .role-badge.learner {
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
    }

    .role-badge.darkmode {
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
    }

    .role-badge.streak {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }

    .role-badge.cert {
      background: rgba(14, 165, 233, 0.12);
      color: #0284c7;
    }

    .role-badge.csv {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
    }

    /* Modal Footer */
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: var(--sic-color-surface, #f8fafc);
      flex-wrap: wrap;
    }

    .footer-note {
      font-size: 0.76rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 500;
    }

    .btn-primary {
      padding: 0.55rem 1.25rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #00a887 0%, #007965 100%);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.86rem;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.25);
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 168, 135, 0.35);
    }

    /* Dark Mode Theme Overrides */
    :host-context([data-theme='dark']),
    :host-context(.dark) {
      .intro-callout.info {
        background: rgba(14, 165, 233, 0.18);
        color: #38bdf8;
      }
      .intro-callout.primary {
        background: rgba(0, 168, 135, 0.18);
        color: #2dd4bf;
      }
      .intro-callout.alert {
        background: rgba(124, 58, 237, 0.22);
        color: #a78bfa;
      }
      .intro-callout.success {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
      }
      .step-title, .box-title, .card-title, .shortcuts-table th {
        color: #f1f5f9;
      }
      .step-desc, .box-desc, .styled-list, .shortcuts-table td {
        color: #cbd5e1;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .workflow-steps,
      .admin-features-grid,
      .km-guide-layout {
        grid-template-columns: 1fr;
      }
      .modal-footer {
        flex-direction: column;
        align-items: stretch;
      }
      .btn-primary {
        width: 100%;
        text-align: center;
      }
    }
  `],
})
export class UserGuideModalComponent {
  private readonly userGuideService = inject(UserGuideService);

  readonly isOpen = this.userGuideService.isOpen;
  readonly activeTab = this.userGuideService.activeTab;

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  setTab(tab: UserGuideTab): void {
    this.userGuideService.setTab(tab);
  }

  close(): void {
    this.userGuideService.closeGuide();
  }
}

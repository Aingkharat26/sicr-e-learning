import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <!-- 1. Hero Welcome Banner -->
      <section class="hero-section">
        <div class="hero-backdrop"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            <span>Soft Inter Chiangrai • Learning & Knowledge Platform</span>
          </div>

          <h1 class="hero-title">
            ยินดีต้อนรับสู่ <span class="highlight">SICR E-LEARNING</span>
          </h1>

          <p class="hero-subtitle">
            ศูนย์กลางการเรียนรู้และพัฒนาทักษะวิชาชีพ พร้อมระบบคลังความรู้ (KM) 
            สำหรับพนักงาน Soft Inter Chiangrai ทุกฝ่าย
          </p>

          <!-- Current User Greeting Card -->
          <div class="user-greeting-card">
            <img [src]="user().avatarUrl" [alt]="user().name" class="greeting-avatar" />
            <div class="greeting-details">
              <div class="greeting-name">
                สวัสดี, <strong>{{ user().thaiName }}</strong>
                <span class="role-pill" [ngClass]="'role-' + currentRole()">
                  {{ currentRole().toUpperCase() }}
                </span>
              </div>
              <p class="greeting-role">{{ user().title }} • {{ user().department }}</p>
            </div>
            <div class="quick-stats">
              <div class="stat-box">
                <span class="stat-num">{{ user().completedCoursesCount }}</span>
                <span class="stat-label">คอร์สที่จบแล้ว</span>
              </div>
              <div class="stat-box">
                <span class="stat-num">{{ user().inProgressCount }}</span>
                <span class="stat-label">กำลังเรียน</span>
              </div>
              <div class="stat-box highlight-stat">
                <span class="stat-num">{{ user().xpPoints }}</span>
                <span class="stat-label">XP สะสม</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. System Architecture & Modules Overview -->
      <section class="modules-section">
        <div class="section-header">
          <h2 class="section-title">โมดูลหลักของระบบ (Core System Modules)</h2>
          <p class="section-sub">เลือกระบบที่ต้องการเข้าใช้งาน หรือสลับสิทธิ์ด้านบนเพื่อดูมุมมองผู้ใช้แต่ละระดับ</p>
        </div>

        <div class="module-cards-grid">
          <!-- Card 1: LMS E-Learning -->
          <div class="module-card card-lms">
            <div class="card-icon-wrapper lms-icon">
              🎓
            </div>
            <div class="card-body">
              <div class="module-tag tag-lms">LMS MODULE</div>
              <h3 class="card-title">ระบบหลักสูตรออนไลน์ (Course Catalog)</h3>
              <p class="card-desc">
                รวมหลักสูตร Onboarding, Technical Skills (Angular, AI, Backend), และข้อสอบประเมินผล พร้อมระบบรับใบประกาศนียบัตร PDF อัตโนมัติ
              </p>
              <div class="feature-bullets">
                <span>✓ วิดีโอบทเรียน + สไลด์ประกอบ</span>
                <span>✓ วัดผลคะแนน & ตัดเกรดอัตโนมัติ</span>
                <span>✓ ติดตาม % ความคืบหน้ารายบท</span>
              </div>
            </div>
            <div class="card-footer">
              <a routerLink="/courses" class="module-btn btn-lms">
                เข้าสู่คลังบทเรียน →
              </a>
            </div>
          </div>

          <!-- Card 2: KM Knowledge Base -->
          <div class="module-card card-km">
            <div class="card-icon-wrapper km-icon">
              💡
            </div>
            <div class="card-body">
              <div class="module-tag tag-km">KM MODULE</div>
              <h3 class="card-title">คลังความรู้องค์กร (Knowledge Base)</h3>
              <p class="card-desc">
                Wiki คลังปัญญาแยกตามฝ่าย (Dev, QA, HR, Sales) ค้นหาไวทันใจ (Instant Search) มีเจ้าของบทความและเก็บบันทึกประวัติการแก้ไข
              </p>
              <div class="feature-bullets">
                <span>✓ แยกแผนก Spaces (Dev, QA, HR)</span>
                <span>✓ ค้นหาคำสำคัญความเร็วสูง</span>
                <span>✓ Markdown & Code Block Viewer</span>
              </div>
            </div>
            <div class="card-footer">
              <a routerLink="/km" class="module-btn btn-km">
                เปิดคลังความรู้ KM →
              </a>
            </div>
          </div>

          <!-- Card 3: Role Management & Instructor/Admin -->
          <div class="module-card card-admin">
            <div class="card-icon-wrapper admin-icon">
              🛡️
            </div>
            <div class="card-body">
              <div class="module-tag tag-admin">MANAGEMENT</div>
              <h3 class="card-title">ระบบบริหารจัดการ (Instructor & Admin)</h3>
              <p class="card-desc">
                เครื่องมือสร้างหลักสูตรสำหรับผู้สอน (Course Builder) และ Dashboard รายงานภาพรวมสำหรับผู้บริหารและ HR
              </p>
              <div class="feature-bullets">
                <span>✓ สร้างโครงสร้างคอร์สและข้อสอบ</span>
                <span>✓ รายงาน Completion Rate พนักงาน</span>
                <span>✓ จัดการสิทธิ์และคอร์สบังคับ</span>
              </div>
            </div>
            <div class="card-footer">
              <a routerLink="/admin" class="module-btn btn-admin">
                แดชบอร์ดจัดการ →
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Development Roadmap Notice -->
      <section class="roadmap-preview-section">
        <div class="roadmap-box">
          <div class="roadmap-badge">📌 ความคืบหน้าการพัฒนา</div>
          <h3>กำลังดำเนินการสร้างตามแผนงาน [HANDOFF.md]</h3>
          <p>
            ขณะนี้โครงสร้างหลัก (Header Shell, Theme System, Role Switcher) พร้อมใช้งานแล้ว 
            ขั้นตอนถัดไปจะเริ่มสร้างหน้า <strong>Course Catalog & Classroom Player</strong>
          </p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1720px;
      margin: 0 auto;
      padding: clamp(1.5rem, 2.5vw, 3rem) clamp(1rem, 2.5vw, 2.5rem);
      width: 100%;
      box-sizing: border-box;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      border-radius: 20px;
      padding: clamp(2rem, 3vw, 3.5rem) clamp(1.5rem, 2.5vw, 3rem);
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.12) 0%, rgba(2, 132, 199, 0.08) 100%);
      border: 1px solid rgba(0, 168, 135, 0.25);
      overflow: hidden;
      margin-bottom: 2.5rem;
      box-sizing: border-box;
      width: 100%;
    }

    .hero-content {
      position: relative;
      z-index: 2;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      background: rgba(0, 168, 135, 0.15);
      color: #007965;
      border: 1px solid rgba(0, 168, 135, 0.3);
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00a887;
      box-shadow: 0 0 0 0 rgba(0, 168, 135, 0.7);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(0, 168, 135, 0.7);
      }
      70% {
        box-shadow: 0 0 0 8px rgba(0, 168, 135, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(0, 168, 135, 0);
      }
    }

    .hero-title {
      font-size: 2.3rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      letter-spacing: -0.8px;
      margin: 0 0 0.75rem 0;
      line-height: 1.2;
    }

    .highlight {
      background: linear-gradient(120deg, #00a887, #0284c7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--sic-color-text-muted, #475569);
      max-width: 680px;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    /* User Greeting Card */
    .user-greeting-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
      background: var(--sic-color-bg, #ffffff);
      padding: 1.25rem 1.75rem;
      border-radius: 16px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }

    .greeting-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2.5px solid #00a887;
    }

    .greeting-details {
      flex: 1;
      min-width: 200px;
    }

    .greeting-name {
      font-size: 1.1rem;
      color: var(--sic-color-text-active, #0f172a);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .greeting-role {
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0.2rem 0 0 0;
    }

    .role-pill {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .role-learner {
      background: rgba(0, 168, 135, 0.15);
      color: #00a887;
    }
    .role-instructor {
      background: rgba(59, 130, 246, 0.15);
      color: #2563eb;
    }
    .role-admin {
      background: rgba(139, 92, 246, 0.15);
      color: #7c3aed;
    }

    .quick-stats {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.4rem 0.8rem;
      border-radius: 10px;
      background: var(--sic-color-surface, #f8fafc);
      min-width: 85px;
    }

    .stat-num {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
    }

    .stat-label {
      font-size: 0.72rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 600;
    }

    .highlight-stat {
      background: rgba(0, 168, 135, 0.1);
    }
    .highlight-stat .stat-num {
      color: #00a887;
    }

    /* Modules Section */
    .modules-section {
      margin-bottom: 3rem;
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.4rem 0;
    }

    .section-sub {
      font-size: 0.9rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
    }

    .module-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: clamp(1.25rem, 2vw, 2rem);
      width: 100%;
      box-sizing: border-box;
    }

    .module-card {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: clamp(1.25rem, 2vw, 1.85rem);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.25s ease;
      box-shadow: 0 4px 15px -2px rgba(0, 0, 0, 0.04);
      box-sizing: border-box;
      width: 100%;
    }

    .module-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.08);
    }

    .card-icon-wrapper {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1.25rem;
    }

    .lms-icon {
      background: rgba(0, 168, 135, 0.15);
    }
    .km-icon {
      background: rgba(2, 132, 199, 0.15);
    }
    .admin-icon {
      background: rgba(139, 92, 246, 0.15);
    }

    .module-tag {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .tag-lms {
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
    }
    .tag-km {
      background: rgba(2, 132, 199, 0.12);
      color: #0284c7;
    }
    .tag-admin {
      background: rgba(139, 92, 246, 0.12);
      color: #7c3aed;
    }

    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.6rem 0;
    }

    .card-desc {
      font-size: 0.88rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.5;
      margin-bottom: 1.25rem;
      flex-grow: 1;
    }

    .feature-bullets {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: var(--sic-color-text, #334155);
      margin-bottom: 1.5rem;
    }

    .module-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-lms {
      background: #00a887;
      color: #ffffff;
    }
    .btn-lms:hover {
      background: #009688;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.35);
    }

    .btn-km {
      background: #0284c7;
      color: #ffffff;
    }
    .btn-km:hover {
      background: #0369a1;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
    }

    .btn-admin {
      background: #7c3aed;
      color: #ffffff;
    }
    .btn-admin:hover {
      background: #6d28d9;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
    }

    /* Roadmap Box */
    .roadmap-preview-section {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 16px;
      border: 1px dashed var(--sic-color-border, #cbd5e1);
      padding: 1.5rem 2rem;
    }

    .roadmap-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #00a887;
      margin-bottom: 0.35rem;
    }

    .roadmap-box h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.4rem 0;
    }

    .roadmap-box p {
      font-size: 0.88rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
      line-height: 1.5;
    }
  `],
})
export class DashboardComponent {
  private readonly authState = inject(AuthStateService);

  readonly currentRole = this.authState.currentRole;
  readonly user = this.authState.currentUser;
}

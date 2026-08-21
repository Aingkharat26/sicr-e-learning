import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStateService, UserRole } from '../../core/services/auth-state.service';
import { AdminKpiSummaryComponent } from './components/admin-kpi-summary.component';
import { EmployeeComplianceTableComponent } from './components/employee-compliance-table.component';
import { CourseGovernanceTableComponent } from './components/course-governance-table.component';
import { CourseBuilderStepperComponent } from './components/course-builder-stepper.component';

export type AdminTab = 'analytics' | 'compliance' | 'governance' | 'builder';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdminKpiSummaryComponent,
    EmployeeComplianceTableComponent,
    CourseGovernanceTableComponent,
    CourseBuilderStepperComponent,
  ],
  template: `
    <div class="admin-page-container">
      <!-- Top Hero Section -->
      <section class="admin-hero">
        <div class="hero-content">
          <div class="role-badge-row">
            <span class="role-pill" [class.admin]="isAdmin()" [class.instructor]="isInstructor()" [class.learner]="isLearner()">
              @switch (currentRole()) {
                @case ('admin') { 🛡️ สิทธิ์ผู้ดูแลระบบ (Admin Mode) }
                @case ('instructor') { 👨‍🏫 สิทธิ์ผู้สอน (Instructor Studio) }
                @case ('learner') { 🎒 สิทธิ์ผู้เรียน (Learner View) }
              }
            </span>
            <span class="org-tag">🏢 Soft Inter Chiangrai Learning Governance</span>
          </div>

          <h1 class="hero-title">
            @if (isAdmin()) {
              ระบบบริหารจัดการและรายงานผลการเรียนรู้องค์กร
            } @else if (isInstructor()) {
              สตูดิโอสร้างหลักสูตรและจัดการบทเรียนสำหรับผู้สอน
            } @else {
              ศูนย์กลางการจัดการและกำกับดูแลหลักสูตร (Management Hub)
            }
          </h1>

          <p class="hero-subtitle">
            @if (isAdmin()) {
              ติดตามสถิติการเรียนรู้ของพนักงานทุกแผนก ตรวจสอบความพร้อมหลักสูตรบังคับ และอนุมัติการเผยแพร่คอร์สใหม่
            } @else if (isInstructor()) {
              ออกแบบหลักสูตร วางโครงสร้างบทเรียนวิดีโอ/เอกสาร และออกข้อสอบวัดผลประเมินทักษะ
            } @else {
              หน้านี้สำหรับฝ่าย HR, ผู้สอน และผู้ดูแลระบบในการกำกับดูแลหลักสูตร สามารถทดสอบสลับ Role ได้ทันที
            }
          </p>
        </div>

        <!-- Role Switcher Shortcuts (Simulation Helper) -->
        <div class="role-switcher-box">
          <span class="box-label">สลับบทบาทจำลอง (Simulate Role):</span>
          <div class="role-btns">
            <button
              class="sim-btn"
              [class.active]="currentRole() === 'admin'"
              (click)="switchRole('admin')"
            >
              🛡️ Admin
            </button>
            <button
              class="sim-btn"
              [class.active]="currentRole() === 'instructor'"
              (click)="switchRole('instructor')"
            >
              👨‍🏫 Instructor
            </button>
            <button
              class="sim-btn"
              [class.active]="currentRole() === 'learner'"
              (click)="switchRole('learner')"
            >
              🎒 Learner
            </button>
          </div>
        </div>
      </section>

      <!-- Main Navigation Tabs -->
      <nav class="admin-tabs-nav">
        <button
          class="nav-tab-btn"
          [class.active]="activeTab() === 'analytics'"
          (click)="setTab('analytics')"
        >
          <span class="tab-icon">📊</span>
          <div class="tab-text">
            <strong>ภาพรวมสถิติองค์กร</strong>
            <span>Enterprise Analytics & KPIs</span>
          </div>
        </button>

        <button
          class="nav-tab-btn"
          [class.active]="activeTab() === 'compliance'"
          (click)="setTab('compliance')"
        >
          <span class="tab-icon">👥</span>
          <div class="tab-text">
            <strong>รายงานผู้เรียนรายบุคคล</strong>
            <span>Employee Compliance Matrix</span>
          </div>
        </button>

        <button
          class="nav-tab-btn"
          [class.active]="activeTab() === 'governance'"
          (click)="setTab('governance')"
        >
          <span class="tab-icon">📚</span>
          <div class="tab-text">
            <strong>จัดการหลักสูตรทั้งหมด</strong>
            <span>Course Governance & Catalog</span>
          </div>
        </button>

        <button
          class="nav-tab-btn studio-tab"
          [class.active]="activeTab() === 'builder'"
          (click)="setTab('builder')"
        >
          <span class="tab-icon">✍️</span>
          <div class="tab-text">
            <strong>สตูดิโอสร้างคอร์สใหม่</strong>
            <span>Course Builder Stepper</span>
          </div>
        </button>
      </nav>

      <!-- Tab Content Views -->
      <main class="tab-content-area">
        @switch (activeTab()) {
          @case ('analytics') {
            <div class="view-wrapper">
              <app-admin-kpi-summary></app-admin-kpi-summary>
            </div>
          }
          @case ('compliance') {
            <div class="view-wrapper">
              <app-employee-compliance-table></app-employee-compliance-table>
            </div>
          }
          @case ('governance') {
            <div class="view-wrapper">
              <app-course-governance-table></app-course-governance-table>
            </div>
          }
          @case ('builder') {
            <div class="view-wrapper">
              <app-course-builder-stepper></app-course-builder-stepper>
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: [`
    .admin-page-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* Hero Section */
    .admin-hero {
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.08) 0%, rgba(15, 23, 42, 0.03) 100%);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      padding: 2rem 2.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    }

    .hero-content {
      flex: 1;
      min-width: 320px;
    }

    .role-badge-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .role-pill {
      font-size: 0.8rem;
      font-weight: 800;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      white-space: nowrap;

      &.admin { background: rgba(239, 68, 68, 0.15); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.3); }
      &.instructor { background: rgba(124, 58, 237, 0.15); color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.3); }
      &.learner { background: rgba(0, 168, 135, 0.15); color: #00a887; border: 1px solid rgba(0, 168, 135, 0.3); }
    }

    .org-tag {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      white-space: nowrap;
    }

    .hero-title {
      font-size: 1.65rem;
      font-weight: 900;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }

    .hero-subtitle {
      font-size: 0.92rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
      line-height: 1.5;
    }

    .role-switcher-box {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);

      .box-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--sic-color-text-muted, #64748b);
      }
    }

    .role-btns {
      display: flex;
      gap: 0.4rem;
    }

    .sim-btn {
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      border: 1px solid var(--sic-color-border, #cbd5e1);
      background: var(--sic-color-surface-hover, #f8fafc);
      color: var(--sic-color-text-active, #0f172a);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        background: var(--sic-color-surface-hover, #e2e8f0);
      }

      &.active {
        background: #00a887;
        color: #ffffff;
        border-color: #00a887;
        box-shadow: 0 2px 8px rgba(0, 168, 135, 0.3);
      }
    }

    /* Sub-navigation Tabs */
    .admin-tabs-nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 0.85rem;
    }

    .nav-tab-btn {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

      .tab-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .tab-text {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        strong {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--sic-color-text-active, #0f172a);
        }

        span {
          font-size: 0.72rem;
          color: var(--sic-color-text-muted, #94a3b8);
        }
      }

      &:hover {
        transform: translateY(-2px);
        border-color: #00a887;
        box-shadow: 0 6px 18px rgba(0, 168, 135, 0.1);
      }

      &.active {
        border-color: #00a887;
        background: rgba(0, 168, 135, 0.05);
        box-shadow: 0 4px 15px rgba(0, 168, 135, 0.15);

        strong {
          color: #00a887;
        }
      }

      &.studio-tab.active {
        border-color: #7c3aed;
        background: rgba(124, 58, 237, 0.05);

        strong {
          color: #7c3aed;
        }
      }
    }

    /* Tab Content Area */
    .tab-content-area {
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .view-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .admin-hero {
        flex-direction: column;
        align-items: stretch;
      }
      .role-switcher-box {
        width: 100%;
        box-sizing: border-box;
      }
      .admin-tabs-nav {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent {
  private readonly authState = inject(AuthStateService);

  readonly currentRole = this.authState.currentRole;
  readonly isAdmin = this.authState.isAdmin;
  readonly isInstructor = this.authState.isInstructor;
  readonly isLearner = this.authState.isLearner;

  readonly activeTab = signal<AdminTab>('analytics');

  constructor() {
    // If user is instructor by default, switch default tab to builder
    if (this.isInstructor()) {
      this.activeTab.set('builder');
    }
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  switchRole(role: UserRole): void {
    this.authState.switchRole(role);
    if (role === 'instructor') {
      this.activeTab.set('builder');
    } else if (role === 'admin') {
      this.activeTab.set('analytics');
    }
  }
}


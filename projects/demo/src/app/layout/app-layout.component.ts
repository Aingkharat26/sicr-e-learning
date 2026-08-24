import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavHeaderComponent } from './nav-header/nav-header.component';
import { AuthStateService } from '../core/services/auth-state.service';
import { UserGuideService } from '../core/services/user-guide.service';
import { UserGuideModalComponent } from '../core/components/user-guide-modal/user-guide-modal.component';
import { AiAssistantWidgetComponent } from '../core/components/ai-assistant/ai-assistant-widget.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavHeaderComponent,
    UserGuideModalComponent,
    AiAssistantWidgetComponent,
  ],
  template: `
    <div class="app-wrapper">
      <!-- 1. Top Navigation Header -->
      <app-nav-header />

      <!-- 2. Active Role Notification Bar -->
      <div class="role-alert-bar" [ngClass]="'bar-' + currentRole()">
        <div class="alert-content">
          <span class="role-badge-pill">{{ currentRole().toUpperCase() }} MODE</span>
          <span class="role-desc">
            @switch (currentRole()) {
              @case ('learner') {
                กำลังจำลองในมุมมอง <strong>ผู้เรียน (Learner)</strong>: ค้นหาคอร์ส, เข้าเรียน, ทำข้อสอบ, และดูความคืบหน้า
              }
              @case ('instructor') {
                กำลังจำลองในมุมมอง <strong>ผู้สอน (Instructor)</strong>: สร้างหลักสูตร, จัดการบทเรียน, และตรวจการบ้าน
              }
              @case ('admin') {
                กำลังจำลองในมุมมอง <strong>ผู้ดูแลระบบ (Admin)</strong>: จัดการสิทธิ์, อนุมัติคอร์ส, และดูรายงานภาพรวมองค์กร
              }
            }
          </span>
        </div>
      </div>

      <!-- 3. Main Routed View Area -->
      <main class="main-content">
        <router-outlet />
      </main>

      <!-- 4. Interactive User Guide Modal -->
      <app-user-guide-modal />

      <!-- 5. SICR AI Knowledge Assistant Widget -->
      <app-ai-assistant-widget />

      <!-- 6. Unified Corporate Footer -->
      <footer class="app-footer">
        <div class="footer-container">
          <div class="footer-left">
            <span class="company-name">© 2026 Soft Inter Chiangrai Co., Ltd.</span>
            <span class="system-desc">SICR E-Learning & Knowledge Management System</span>
          </div>
          <div class="footer-links">
            <button type="button" class="footer-guide-btn" (click)="openGuide()">
              📖 คู่มือการใช้งาน (Help & Guide)
            </button>
            <a href="https://www.softinterchiangrai.com" target="_blank" rel="noopener">เว็บไซต์องค์กร</a>
            <a routerLink="/km">คลังความรู้ KM</a>
            <a routerLink="/courses">หลักสูตร</a>
            <span class="version-tag">v1.0.0 (MVP)</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--sic-color-surface, #f8fafc);
      color: var(--sic-color-text, #1e293b);
      transition: background-color 0.25s ease, color 0.25s ease;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
      box-sizing: border-box;
    }

    /* Role Alert Banner */
    .role-alert-bar {
      padding: 0.45rem 1rem;
      font-size: 0.8rem;
      border-bottom: 1px solid transparent;
      display: flex;
      justify-content: center;
      transition: all 0.3s ease;
      width: 100%;
      max-width: 100vw;
      box-sizing: border-box;
    }

    .bar-learner {
      background: rgba(0, 168, 135, 0.08);
      border-color: rgba(0, 168, 135, 0.2);
      color: #00a887;
    }

    .bar-instructor {
      background: rgba(59, 130, 246, 0.08);
      border-color: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .bar-admin {
      background: rgba(139, 92, 246, 0.08);
      border-color: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
    }

    .alert-content {
      max-width: 1720px;
      width: 100%;
      margin: 0 auto;
      padding: 0 clamp(1rem, 2.5vw, 2.5rem);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-sizing: border-box;
    }

    .role-badge-pill {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      background: currentColor;
      color: #ffffff !important;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .bar-learner .role-badge-pill {
      background: #00a887;
    }
    .bar-instructor .role-badge-pill {
      background: #2563eb;
    }
    .bar-admin .role-badge-pill {
      background: #7c3aed;
    }

    .role-desc {
      font-weight: 500;
    }

    /* Main Area */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Footer */
    .app-footer {
      background: var(--sic-color-bg, #ffffff);
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 1.5rem 0;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1720px;
      margin: 0 auto;
      padding: 0 clamp(1rem, 2.5vw, 2.5rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      box-sizing: border-box;
    }

    .footer-left {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .company-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
    }

    .system-desc {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .footer-links a {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: #00a887;
    }

    .footer-guide-btn {
      background: none;
      border: 1px dashed var(--sic-color-border, #cbd5e1);
      border-radius: 8px;
      padding: 0.25rem 0.65rem;
      font-size: 0.8rem;
      color: #00a887;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .footer-guide-btn:hover {
      background: rgba(0, 168, 135, 0.1);
      border-color: #00a887;
    }

    .version-tag {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      background: var(--sic-color-surface, #f1f5f9);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 6px;
      color: var(--sic-color-text-muted, #475569);
    }

    @media (max-width: 640px) {
      .footer-container {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
})
export class AppLayoutComponent {
  private readonly authState = inject(AuthStateService);
  private readonly userGuideService = inject(UserGuideService);

  readonly currentRole = this.authState.currentRole;

  openGuide(): void {
    this.userGuideService.openGuide('learner');
  }
}

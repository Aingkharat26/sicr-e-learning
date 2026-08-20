import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="placeholder-page">
      <div class="placeholder-card">
        <div class="icon">🛡️</div>
        <h2>ระบบจัดการหลักสูตรและแอดมิน (Management & Governance)</h2>
        <p>
          @if (isAdmin()) {
            โหมด <strong>ผู้ดูแลระบบ (Admin)</strong>: อนุมัติคอร์ส, ตรวจสอบ Completion Rate พนักงานทั้งบริษัท และจัดการสิทธิ์ผู้ใช้งาน
          } @else {
            โหมด <strong>ผู้สอน (Instructor)</strong>: Course Builder สร้างบทเรียน, อัปโหลดวิดีโอ/สไลด์ และออกข้อสอบประเมินผล
          }
        </p>
        <a routerLink="/" class="back-link">← กลับหน้าแรก</a>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-page { max-width: 900px; margin: 3rem auto; padding: 1.5rem; }
    .placeholder-card {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h2 { font-size: 1.5rem; font-weight: 800; color: var(--sic-color-text-active, #0f172a); margin: 0 0 0.5rem 0; }
    p { color: var(--sic-color-text-muted, #64748b); font-size: 0.95rem; margin-bottom: 1.5rem; }
    .back-link { color: #7c3aed; font-weight: 700; text-decoration: none; }
  `]
})
export class AdminPlaceholderComponent {
  private readonly authState = inject(AuthStateService);
  readonly isAdmin = this.authState.isAdmin;
}

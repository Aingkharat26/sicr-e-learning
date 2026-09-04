import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { CourseGovernanceRecord, CoursePublishStatus } from '../../../core/models/admin.model';

@Component({
  selector: 'app-course-governance-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="gov-container">
      <!-- Toolbar & Search -->
      <div class="gov-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาชื่อหลักสูตร, ผู้สอน, หรือหมวดหมู่..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
          @if (searchQuery()) {
            <button class="clear-btn" (click)="clearSearch()">✕</button>
          }
        </div>

        <!-- Status Filter Pills -->
        <div class="status-tabs">
          <button
            class="tab-btn"
            [class.active]="selectedStatus() === 'All'"
            (click)="setStatusFilter('All')"
          >
            ทั้งหมด ({{ allCourses().length }})
          </button>
          <button
            class="tab-btn published"
            [class.active]="selectedStatus() === 'published'"
            (click)="setStatusFilter('published')"
          >
            🟢 เผยแพร่แล้ว ({{ countByStatus('published') }})
          </button>
          <button
            class="tab-btn pending"
            [class.active]="selectedStatus() === 'pending_approval'"
            (click)="setStatusFilter('pending_approval')"
          >
            ⏳ รออนุมัติ ({{ countByStatus('pending_approval') }})
          </button>
          <button
            class="tab-btn draft"
            [class.active]="selectedStatus() === 'draft'"
            (click)="setStatusFilter('draft')"
          >
            📝 ร่าง (Draft) ({{ countByStatus('draft') }})
          </button>
          <button
            class="tab-btn archived"
            [class.active]="selectedStatus() === 'archived'"
            (click)="setStatusFilter('archived')"
          >
            📦 เก็บถาวร ({{ countByStatus('archived') }})
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="responsive-table-wrapper">
        <table class="gov-table">
          <thead>
            <tr>
              <th>หลักสูตร (Course)</th>
              <th>หมวดหมู่</th>
              <th>ผู้สอน (Instructor)</th>
              <th>ผู้ลงทะเบียน</th>
              <th>ความพึงพอใจ</th>
              <th>สถานะหลักสูตร</th>
              <th>จัดการ / การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            @for (c of courses(); track c.id) {
              <tr>
                <td>
                  <div class="course-cell">
                    <div class="course-info">
                      <div class="title-row">
                        <span class="course-title">{{ c.title }}</span>
                        @if (c.isMandatory) {
                          <span class="mandatory-badge">คอร์สบังคับ</span>
                        }
                      </div>
                      @if (c.thaiTitle) {
                        <span class="thai-title">{{ c.thaiTitle }}</span>
                      }
                      <span class="course-id-tag">รหัส: {{ c.id }} • 💎 {{ c.xpAward }} XP</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="category-badge">{{ c.category }}</span>
                </td>
                <td>
                  <div class="instructor-cell">
                    <img [src]="c.instructorAvatar" [alt]="c.instructorName" class="instructor-avatar" />
                    <span class="instructor-name">{{ c.instructorName }}</span>
                  </div>
                </td>
                <td>
                  <div class="enroll-cell">
                    <strong>{{ c.totalEnrolled }}</strong> คน
                    <span class="sub-rate">จบ {{ c.completionRate }}%</span>
                  </div>
                </td>
                <td>
                  <div class="rating-cell">
                    <span class="star-icon">⭐</span>
                    <strong>{{ c.rating }}</strong>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class]="c.status">
                    @switch (c.status) {
                      @case ('published') { 🟢 เผยแพร่แล้ว }
                      @case ('pending_approval') { ⏳ รอ Admin อนุมัติ }
                      @case ('draft') { 📝 แบบร่าง }
                      @case ('archived') { 📦 เก็บถาวร }
                    }
                  </span>
                </td>
                <td>
                  <div class="actions-cell">
                    <a [routerLink]="['/courses', c.id]" class="action-btn preview-btn" title="ดูตัวอย่างคอร์ส">
                      👁️ ดูคอร์ส
                    </a>

                    @if (c.status === 'pending_approval') {
                      <button class="action-btn approve-btn" (click)="approveCourse(c)">
                        ✅ อนุมัติ
                      </button>
                    }

                    @if (c.status === 'published') {
                      <button class="action-btn archive-btn" (click)="toggleArchive(c)">
                        📦 เก็บถาวร
                      </button>
                    }

                    @if (c.status === 'archived') {
                      <button class="action-btn restore-btn" (click)="publishCourse(c)">
                        🔄 กู้คืน & เผยแพร่
                      </button>
                    }

                    @if (c.status === 'draft') {
                      <button class="action-btn publish-btn" (click)="publishCourse(c)">
                        🚀 เผยแพร่
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-cell">
                  <div class="empty-state">
                    <span class="empty-icon">📚</span>
                    <p>ไม่พบหลักสูตรที่ตรงกับเงื่อนไขการค้นหา</p>
                    <button class="reset-filter-btn" (click)="resetFilters()">ดูคอร์สทั้งหมด</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Toast Notification -->
      @if (toastMessage()) {
        <div class="floating-toast">
          {{ toastMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .gov-container {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .gov-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      max-width: 380px;

      .search-icon {
        position: absolute;
        left: 0.9rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        color: #94a3b8;
      }

      input {
        width: 100%;
        padding: 0.65rem 2.2rem 0.65rem 2.4rem;
        background: var(--sic-color-surface-hover, #f8fafc);
        border: 1px solid var(--sic-color-border, #e2e8f0);
        border-radius: 10px;
        font-size: 0.88rem;
        color: var(--sic-color-text-active, #0f172a);
        outline: none;
        box-sizing: border-box;

        &:focus {
          border-color: #00a887;
          background: var(--sic-color-bg, #ffffff);
        }
      }

      .clear-btn {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
      }
    }

    .status-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .tab-btn {
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-surface-hover, #f8fafc);
      color: var(--sic-color-text-muted, #64748b);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background: var(--sic-color-border, #e2e8f0);
        color: var(--sic-color-text-active, #0f172a);
      }

      &.active {
        background: #00a887;
        color: #ffffff;
        border-color: #00a887;
      }
    }

    .responsive-table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .gov-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;

      thead {
        background: var(--sic-color-surface-hover, #f8fafc);
        border-bottom: 1px solid var(--sic-color-border, #e2e8f0);

        th {
          padding: 0.85rem 1rem;
          font-weight: 800;
          color: var(--sic-color-text-muted, #475569);
          white-space: nowrap;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.03em;
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
          transition: background 0.15s ease;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: var(--sic-color-surface-hover, #f8fafc);
          }

          td {
            padding: 0.85rem 1rem;
            vertical-align: middle;
          }
        }
      }
    }

    .course-cell {
      max-width: 320px;

      .course-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .title-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .course-title {
        font-weight: 800;
        color: var(--sic-color-text-active, #0f172a);
        font-size: 0.88rem;
        line-height: 1.3;
      }

      .mandatory-badge {
        font-size: 0.68rem;
        font-weight: 800;
        background: rgba(239, 68, 68, 0.12);
        color: #dc2626;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        white-space: nowrap;
      }

      .thai-title {
        font-size: 0.78rem;
        color: var(--sic-color-text-muted, #64748b);
        line-height: 1.2;
      }

      .course-id-tag {
        font-size: 0.72rem;
        color: #94a3b8;
      }
    }

    .category-badge {
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      white-space: nowrap;
    }

    .instructor-cell {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      .instructor-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }

      .instructor-name {
        font-weight: 700;
        color: var(--sic-color-text-active, #0f172a);
        white-space: nowrap;
        font-size: 0.82rem;
      }
    }

    .enroll-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      white-space: nowrap;

      strong {
        color: var(--sic-color-text-active, #0f172a);
      }

      .sub-rate {
        font-size: 0.72rem;
        color: var(--sic-color-text-muted, #64748b);
      }
    }

    .rating-cell {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.85rem;
      white-space: nowrap;
      color: var(--sic-color-text-active, #0f172a);

      .star-icon { color: #f59e0b; font-size: 0.85rem; }
    }

    .status-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      white-space: nowrap;

      &.published { background: rgba(16, 185, 129, 0.12); color: #059669; }
      &.pending_approval { background: rgba(245, 158, 11, 0.15); color: #d97706; }
      &.draft { background: rgba(100, 116, 139, 0.15); color: #475569; }
      &.archived { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
    }

    .actions-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;

      .action-btn {
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        white-space: nowrap;
        border: 1px solid transparent;
        transition: all 0.2s ease;

        &.preview-btn {
          background: var(--sic-color-surface-hover, #f1f5f9);
          color: var(--sic-color-text-active, #0f172a);
          border-color: var(--sic-color-border, #cbd5e1);

          &:hover {
            border-color: #00a887;
            color: #00a887;
          }
        }

        &.approve-btn {
          background: #10b981;
          color: #ffffff;

          &:hover { background: #059669; }
        }

        &.publish-btn {
          background: #00a887;
          color: #ffffff;

          &:hover { background: #00876c; }
        }

        &.archive-btn {
          background: transparent;
          border-color: #fca5a5;
          color: #dc2626;

          &:hover { background: rgba(239, 68, 68, 0.12); }
        }

        &.restore-btn {
          background: transparent;
          border-color: #93c5fd;
          color: #2563eb;

          &:hover { background: rgba(37, 99, 235, 0.12); }
        }
      }
    }

    .empty-cell {
      padding: 3rem 1rem !important;
      text-align: center;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;

      .empty-icon { font-size: 2.2rem; }
      p { font-size: 0.9rem; color: var(--sic-color-text-muted, #64748b); margin: 0; }
      .reset-filter-btn {
        padding: 0.4rem 0.85rem;
        border-radius: 8px;
        background: #00a887;
        color: #ffffff;
        border: none;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
      }
    }

    .floating-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #0f172a;
      color: #ffffff;
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: toastSlideUp 0.3s ease;
    }

    @keyframes toastSlideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class CourseGovernanceTableComponent {
  private readonly adminService = inject(AdminService);

  readonly allCourses = this.adminService.courseGovernanceList;
  readonly courses = this.adminService.filteredCourseGovernance;
  readonly searchQuery = this.adminService.governanceSearchQuery;
  readonly selectedStatus = this.adminService.governanceStatusFilter;

  readonly toastMessage = signal<string | null>(null);

  countByStatus(status: CoursePublishStatus): number {
    return this.allCourses().filter((c) => c.status === status).length;
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.adminService.setGovernanceSearchQuery(val);
  }

  clearSearch(): void {
    this.adminService.setGovernanceSearchQuery('');
  }

  setStatusFilter(status: CoursePublishStatus | 'All'): void {
    this.adminService.setGovernanceStatusFilter(status);
  }

  resetFilters(): void {
    this.adminService.setGovernanceSearchQuery('');
    this.adminService.setGovernanceStatusFilter('All');
  }

  approveCourse(record: CourseGovernanceRecord): void {
    this.adminService.approveCourse(record.id);
    this.showToast(`✅ อนุมัติหลักสูตร "${record.title}" เรียบร้อยแล้ว (เผยแพร่ในแคตตาล็อกทันที)`);
  }

  publishCourse(record: CourseGovernanceRecord): void {
    this.adminService.updateCourseStatus(record.id, 'published');
    this.showToast(`🚀 เผยแพร่หลักสูตร "${record.title}" สำเร็จ`);
  }

  toggleArchive(record: CourseGovernanceRecord): void {
    this.adminService.updateCourseStatus(record.id, 'archived');
    this.showToast(`📦 ย้ายหลักสูตร "${record.title}" เข้าสู่คลังเก็บถาวร (Archived) แล้ว`);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }
}

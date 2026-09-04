import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { EmployeeComplianceRecord } from '../../../core/models/admin.model';

@Component({
  selector: 'app-employee-compliance-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <!-- Toolbar & Filters -->
      <div class="table-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาชื่อพนักงาน, รหัสพนักงาน, ตำแหน่ง..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
          @if (searchQuery()) {
            <button class="clear-btn" (click)="clearSearch()">✕</button>
          }
        </div>

        <div class="filters-group">
          <!-- Department Filter -->
          <div class="filter-item">
            <label>แผนก:</label>
            <select [value]="selectedDept()" (change)="onDeptChange($event)">
              <option value="All">ทุกแผนก (All)</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Infrastructure & DevOps">Infrastructure & DevOps</option>
              <option value="Business & Solutions">Business & Solutions</option>
              <option value="People & Culture">People & Culture</option>
            </select>
          </div>

          <!-- Compliance Status Filter -->
          <div class="filter-item">
            <label>สถานะ:</label>
            <select [value]="selectedStatus()" (change)="onStatusChange($event)">
              <option value="All">ทุกสถานะ (All)</option>
              <option value="compliant">✅ ผ่านเกณฑ์ครบ (Compliant)</option>
              <option value="in_progress">⏳ กำลังเรียน (In Progress)</option>
              <option value="overdue">⚠️ เกินกำหนด (Overdue)</option>
              <option value="not_started">⚪ ยังไม่เริ่ม (Not Started)</option>
            </select>
          </div>

          <!-- Export CSV Button -->
          <button class="export-btn" (click)="exportCsv()" title="ส่งออกรายงานเป็นไฟล์ CSV">
            📥 Export รายงาน CSV
          </button>
        </div>
      </div>

      <!-- Compliance Table -->
      <div class="responsive-table-wrapper">
        <table class="compliance-table">
          <thead>
            <tr>
              <th>พนักงาน (Employee)</th>
              <th>แผนก / ตำแหน่ง</th>
              <th>คอร์สบังคับ (Mandatory)</th>
              <th>คอร์สเสริม</th>
              <th>แต้ม XP รวม</th>
              <th>เข้าใช้งานล่าสุด</th>
              <th>สถานะเกณฑ์</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            @for (emp of employees(); track emp.id) {
              <tr [class.selected]="selectedEmployee()?.id === emp.id">
                <td>
                  <div class="user-cell">
                    <img [src]="emp.avatar" [alt]="emp.name" class="user-avatar" />
                    <div class="user-meta">
                      <span class="user-thai-name">{{ emp.thaiName }}</span>
                      <span class="user-eng-name">{{ emp.name }} • <span class="emp-id">{{ emp.id }}</span></span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="dept-cell">
                    <span class="dept-badge">{{ emp.department }}</span>
                    <span class="role-text">{{ emp.role }}</span>
                  </div>
                </td>
                <td>
                  <div class="progress-cell">
                    <div class="progress-ratio">
                      <strong>{{ emp.mandatoryCompleted }} / {{ emp.mandatoryTotal }}</strong> คอร์ส
                    </div>
                    <div class="mini-progress-bar">
                      <div
                        class="mini-progress-fill"
                        [style.width.%]="(emp.mandatoryCompleted / emp.mandatoryTotal) * 100"
                        [class.complete]="emp.mandatoryCompleted === emp.mandatoryTotal"
                        [class.partial]="emp.mandatoryCompleted > 0 && emp.mandatoryCompleted < emp.mandatoryTotal"
                        [class.zero]="emp.mandatoryCompleted === 0"
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="elective-badge">{{ emp.electiveCompleted }} คอร์ส</span>
                </td>
                <td>
                  <span class="xp-tag">💎 {{ emp.totalXp | number }}</span>
                </td>
                <td>
                  <span class="last-active-text">{{ emp.lastActive }}</span>
                </td>
                <td>
                  <span class="status-pill" [class]="emp.status">
                    @switch (emp.status) {
                      @case ('compliant') { ✅ ครบตามเกณฑ์ }
                      @case ('in_progress') { ⏳ กำลังเรียน }
                      @case ('overdue') { ⚠️ เกินกำหนด }
                      @case ('not_started') { ⚪ ยังไม่เริ่ม }
                    }
                  </span>
                </td>
                <td>
                  <button class="view-detail-btn" (click)="openDetailModal(emp)">
                    🔍 ตรวจสอบ
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty-cell">
                  <div class="empty-state">
                    <span class="empty-icon">🔎</span>
                    <p>ไม่พบรายชื่อพนักงานที่ตรงกับเงื่อนไขการค้นหา</p>
                    <button class="reset-filter-btn" (click)="resetFilters()">ล้างตัวกรองทั้งหมด</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Employee Detail Modal -->
      @if (selectedEmployee(); as emp) {
        <div class="modal-backdrop" (click)="closeDetailModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <img [src]="emp.avatar" [alt]="emp.name" class="modal-avatar" />
                <div>
                  <h3>{{ emp.thaiName }} ({{ emp.name }})</h3>
                  <p>{{ emp.role }} • {{ emp.department }} • <strong>รหัส: {{ emp.id }}</strong></p>
                </div>
              </div>
              <button class="close-btn" (click)="closeDetailModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="stat-summary-boxes">
                <div class="stat-box">
                  <span class="stat-lbl">สถานะการกำกับดูแล</span>
                  <span class="status-pill" [class]="emp.status">
                    @switch (emp.status) {
                      @case ('compliant') { ✅ ครบตามเกณฑ์ }
                      @case ('in_progress') { ⏳ กำลังเรียน }
                      @case ('overdue') { ⚠️ เกินกำหนด }
                      @case ('not_started') { ⚪ ยังไม่เริ่ม }
                    }
                  </span>
                </div>
                <div class="stat-box">
                  <span class="stat-lbl">คอร์สบังคับ</span>
                  <span class="stat-val">{{ emp.mandatoryCompleted }} / {{ emp.mandatoryTotal }} หลักสูตร</span>
                </div>
                <div class="stat-box">
                  <span class="stat-lbl">แต้ม XP สะสม</span>
                  <span class="stat-val xp">💎 {{ emp.totalXp | number }}</span>
                </div>
              </div>

              <h4 class="section-title">📚 รายการหลักสูตรที่ได้รับมอบหมายและสถานะ</h4>
              <div class="assigned-courses-list">
                @for (c of emp.assignedCourses; track c.courseId) {
                  <div class="course-track-card">
                    <div class="course-track-info">
                      <span class="course-name">{{ c.courseTitle }}</span>
                      <span class="due-date">📅 กำหนดส่ง: {{ c.dueDate }}</span>
                    </div>
                    <div class="course-track-progress">
                      <div class="progress-percent">{{ c.progress }}%</div>
                      <div class="track-bar">
                        <div class="track-fill" [style.width.%]="c.progress" [class.done]="c.progress === 100" [class.over]="c.status === 'overdue'"></div>
                      </div>
                      <span class="track-status" [class]="c.status">
                        @switch (c.status) {
                          @case ('completed') { สำเร็จ 100% }
                          @case ('in_progress') { กำลังศึกษา }
                          @case ('overdue') { เกินกำหนด }
                          @case ('not_started') { ยังไม่เริ่ม }
                        }
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="modal-footer">
              <button class="send-reminder-btn" (click)="sendReminderToast(emp)">
                🔔 ส่งข้อความแจ้งเตือน (Slack/Email)
              </button>
              <button class="close-modal-btn" (click)="closeDetailModal()">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      }

      <!-- Notification Toast -->
      @if (toastMessage()) {
        <div class="floating-toast">
          {{ toastMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .table-container {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .table-toolbar {
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
      max-width: 420px;

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
        transition: all 0.2s ease;

        &:focus {
          border-color: #00a887;
          background: var(--sic-color-bg, #ffffff);
          box-shadow: 0 0 0 3px rgba(0, 168, 135, 0.1);
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
        font-size: 0.85rem;
      }
    }

    .filters-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      label {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--sic-color-text-muted, #64748b);
        white-space: nowrap;
      }

      select {
        padding: 0.55rem 0.85rem;
        border-radius: 8px;
        border: 1px solid var(--sic-color-border, #e2e8f0);
        background: var(--sic-color-surface-hover, #f8fafc);
        font-size: 0.82rem;
        color: var(--sic-color-text-active, #0f172a);
        font-weight: 600;
        outline: none;
        cursor: pointer;

        &:focus {
          border-color: #00a887;
        }
      }
    }

    .export-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(0, 168, 135, 0.3);
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        background: #00a887;
        color: #ffffff;
      }
    }

    .responsive-table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .compliance-table {
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

          &.selected {
            background: rgba(0, 168, 135, 0.06);
          }

          td {
            padding: 0.85rem 1rem;
            vertical-align: middle;
          }
        }
      }
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        border: 2px solid var(--sic-color-border, #e2e8f0);
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;

        .user-thai-name {
          font-weight: 800;
          color: var(--sic-color-text-active, #0f172a);
          white-space: nowrap;
        }

        .user-eng-name {
          font-size: 0.75rem;
          color: var(--sic-color-text-muted, #64748b);
          white-space: nowrap;

          .emp-id {
            color: #00a887;
            font-weight: 700;
          }
        }
      }
    }

    .dept-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      .dept-badge {
        font-size: 0.72rem;
        font-weight: 700;
        background: rgba(0, 168, 135, 0.08);
        color: #00a887;
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
        width: fit-content;
        white-space: nowrap;
      }

      .role-text {
        font-size: 0.75rem;
        color: var(--sic-color-text-muted, #64748b);
        white-space: nowrap;
      }
    }

    .progress-cell {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 110px;

      .progress-ratio {
        font-size: 0.78rem;
        color: var(--sic-color-text-muted, #64748b);

        strong {
          color: var(--sic-color-text-active, #0f172a);
        }
      }

      .mini-progress-bar {
        height: 6px;
        background: var(--sic-color-border, #e2e8f0);
        border-radius: 9999px;
        overflow: hidden;
      }

      .mini-progress-fill {
        height: 100%;
        border-radius: 9999px;

        &.complete { background: #10b981; }
        &.partial { background: #f59e0b; }
        &.zero { background: #e2e8f0; }
      }
    }

    .elective-badge {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      background: var(--sic-color-surface-hover, #f1f5f9);
      border-radius: 6px;
      color: var(--sic-color-text-active, #334155);
      white-space: nowrap;
    }

    .xp-tag {
      font-size: 0.82rem;
      font-weight: 800;
      color: #7c3aed;
      white-space: nowrap;
    }

    .last-active-text {
      font-size: 0.78rem;
      color: var(--sic-color-text-muted, #64748b);
      white-space: nowrap;
    }

    .status-pill {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      white-space: nowrap;

      &.compliant { background: rgba(16, 185, 129, 0.12); color: #059669; }
      &.in_progress { background: rgba(245, 158, 11, 0.15); color: #d97706; }
      &.overdue { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
      &.not_started { background: rgba(148, 163, 184, 0.15); color: #64748b; }
    }

    .view-detail-btn {
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--sic-color-border, #cbd5e1);
      background: var(--sic-color-bg, #ffffff);
      color: var(--sic-color-text-active, #0f172a);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        border-color: #00a887;
        color: #00a887;
        background: rgba(0, 168, 135, 0.05);
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

    /* Modal Backdrop & Card */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }

    .modal-card {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      overflow: hidden;
      animation: modalFadeIn 0.2s ease;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);

      .modal-title-group {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        .modal-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--sic-color-text-active, #0f172a);
        }

        p {
          margin: 0.15rem 0 0 0;
          font-size: 0.8rem;
          color: var(--sic-color-text-muted, #64748b);
        }
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #94a3b8;
        cursor: pointer;
        padding: 0.3rem;
      }
    }

    .modal-body {
      padding: 1.25rem 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .stat-summary-boxes {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;

      .stat-box {
        background: var(--sic-color-surface-hover, #f8fafc);
        border: 1px solid var(--sic-color-border, #e2e8f0);
        border-radius: 10px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.3rem;

        .stat-lbl {
          font-size: 0.72rem;
          color: var(--sic-color-text-muted, #64748b);
          font-weight: 700;
        }

        .stat-val {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--sic-color-text-active, #0f172a);

          &.xp { color: #7c3aed; }
        }
      }
    }

    .section-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0;
    }

    .assigned-courses-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .course-track-card {
      background: var(--sic-color-surface-hover, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .course-track-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;

      .course-name {
        font-size: 0.85rem;
        font-weight: 800;
        color: var(--sic-color-text-active, #0f172a);
      }

      .due-date {
        font-size: 0.72rem;
        color: var(--sic-color-text-muted, #64748b);
        white-space: nowrap;
      }
    }

    .course-track-progress {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .progress-percent {
        font-size: 0.78rem;
        font-weight: 800;
        color: var(--sic-color-text-active, #0f172a);
        width: 38px;
      }

      .track-bar {
        flex: 1;
        height: 6px;
        background: var(--sic-color-border, #e2e8f0);
        border-radius: 9999px;
        overflow: hidden;
      }

      .track-fill {
        height: 100%;
        background: #00a887;
        border-radius: 9999px;

        &.done { background: #10b981; }
        &.over { background: #ef4444; }
      }

      .track-status {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
        white-space: nowrap;

        &.completed { background: rgba(16, 185, 129, 0.15); color: #059669; }
        &.in_progress { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        &.overdue { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
        &.not_started { background: rgba(148, 163, 184, 0.15); color: #64748b; }
      }
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;

      .send-reminder-btn {
        padding: 0.55rem 1rem;
        border-radius: 8px;
        border: none;
        background: linear-gradient(135deg, #00a887, #10b981);
        color: #ffffff;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
      }

      .close-modal-btn {
        padding: 0.55rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--sic-color-border, #cbd5e1);
        background: transparent;
        color: var(--sic-color-text-active, #0f172a);
        font-size: 0.82rem;
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

    @media (max-width: 768px) {
      .table-toolbar {
        flex-direction: column;
        align-items: stretch;
      }
      .search-box {
        max-width: 100%;
      }
      .filters-group {
        flex-direction: column;
        align-items: stretch;
      }
      .stat-summary-boxes {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeeComplianceTableComponent {
  private readonly adminService = inject(AdminService);

  readonly employees = this.adminService.filteredEmployees;
  readonly searchQuery = this.adminService.employeeSearchQuery;
  readonly selectedDept = this.adminService.selectedDepartment;
  readonly selectedStatus = this.adminService.selectedComplianceStatus;

  readonly selectedEmployee = signal<EmployeeComplianceRecord | null>(null);
  readonly toastMessage = signal<string | null>(null);

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.adminService.setEmployeeSearchQuery(val);
  }

  clearSearch(): void {
    this.adminService.setEmployeeSearchQuery('');
  }

  onDeptChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.adminService.setSelectedDepartment(val);
  }

  onStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.adminService.setSelectedComplianceStatus(val);
  }

  resetFilters(): void {
    this.adminService.setEmployeeSearchQuery('');
    this.adminService.setSelectedDepartment('All');
    this.adminService.setSelectedComplianceStatus('All');
  }

  exportCsv(): void {
    this.adminService.exportComplianceReportCsv();
    this.showToast('✅ ส่งออกรายงานพนักงานและสถานะคอร์สบังคับ (CSV) สำเร็จ');
  }

  openDetailModal(emp: EmployeeComplianceRecord): void {
    this.selectedEmployee.set(emp);
  }

  closeDetailModal(): void {
    this.selectedEmployee.set(null);
  }

  sendReminderToast(emp: EmployeeComplianceRecord): void {
    this.showToast(`🔔 ส่งข้อความแจ้งเตือนการเรียนให้ ${emp.thaiName} ทาง Slack & Email เรียบร้อยแล้ว`);
    this.closeDetailModal();
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }
}

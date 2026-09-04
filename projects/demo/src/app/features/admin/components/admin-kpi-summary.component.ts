import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-kpi-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-section">
      <!-- Main Metric Cards Grid -->
      <div class="metric-grid">
        <div class="metric-card primary">
          <div class="card-glow"></div>
          <div class="metric-header">
            <span class="metric-icon">👥</span>
            <span class="trend-badge positive">+12% เดือนนี้</span>
          </div>
          <div class="metric-val">{{ metrics().totalLearners }} คน</div>
          <div class="metric-lbl">พนักงานในระบบ (Active {{ metrics().activeLearnersThisMonth }} คน)</div>
          <div class="progress-track">
            <div class="progress-fill primary" [style.width.%]="(metrics().activeLearnersThisMonth / metrics().totalLearners) * 100"></div>
          </div>
        </div>

        <div class="metric-card emerald">
          <div class="card-glow"></div>
          <div class="metric-header">
            <span class="metric-icon">🎯</span>
            <span class="trend-badge positive">เกณฑ์เป้าหมาย 85%</span>
          </div>
          <div class="metric-val">{{ metrics().mandatoryComplianceRate }}%</div>
          <div class="metric-lbl">อัตราผ่านคอร์สบังคับ (Mandatory Compliance)</div>
          <div class="progress-track">
            <div class="progress-fill emerald" [style.width.%]="metrics().mandatoryComplianceRate"></div>
          </div>
        </div>

        <div class="metric-card teal">
          <div class="card-glow"></div>
          <div class="metric-header">
            <span class="metric-icon">📈</span>
            <span class="trend-badge neutral">เฉลี่ยทั้งองค์กร</span>
          </div>
          <div class="metric-val">{{ metrics().overallCompletionRate }}%</div>
          <div class="metric-lbl">อัตราความสำเร็จภาพรวม (Course Completion)</div>
          <div class="progress-track">
            <div class="progress-fill teal" [style.width.%]="metrics().overallCompletionRate"></div>
          </div>
        </div>

        <div class="metric-card amber">
          <div class="card-glow"></div>
          <div class="metric-header">
            <span class="metric-icon">📜</span>
            <span class="trend-badge gold">Verified Official</span>
          </div>
          <div class="metric-val">{{ metrics().totalCertificatesIssued }} ใบ</div>
          <div class="metric-lbl">ใบประกาศนียบัตรดิจิทัลที่อนุมัติแล้ว</div>
          <div class="metric-sub">พร้อมรหัสตรวจสอบบล็อกเชน & QR</div>
        </div>

        <div class="metric-card purple">
          <div class="card-glow"></div>
          <div class="metric-header">
            <span class="metric-icon">⏱️</span>
            <span class="trend-badge neutral">+35 ชม./สัปดาห์</span>
          </div>
          <div class="metric-val">{{ metrics().totalLearningHours }} ชม.</div>
          <div class="metric-lbl">ชั่วโมงการเรียนรู้สะสม (Learning Time)</div>
          <div class="metric-sub">เฉลี่ย 14 ชม./คน</div>
        </div>

        <div class="metric-card blue">
          <div class="card-glow"></div>
          <div class="metric-header">
            <span class="metric-icon">💎</span>
            <span class="trend-badge positive">Reward Points</span>
          </div>
          <div class="metric-val">{{ metrics().totalXpDistributed | number }}</div>
          <div class="metric-lbl">แต้ม XP ที่แจกจ่ายแล้วในระบบ</div>
          <div class="metric-sub">ใช้แลก Learning Budget ได้</div>
        </div>
      </div>

      <!-- Department Compliance Breakdown -->
      <div class="dept-summary-card">
        <div class="dept-header">
          <div class="dept-title-group">
            <span class="dept-icon">🏢</span>
            <div>
              <h3>ความพร้อมและการปฏิบัติตามมาตรฐานแยกตามแผนก (Department Compliance)</h3>
              <p>อัตราส่วนพนักงานที่ผ่านหลักสูตรบังคับและแต้มเฉลี่ยของแต่ละหน่วยงานใน Soft Inter Chiangrai</p>
            </div>
          </div>
        </div>

        <div class="dept-chips-grid">
          @for (dept of departments(); track dept.department) {
            <div class="dept-item-card">
              <div class="dept-top">
                <span class="dept-emoji">{{ dept.icon }}</span>
                <span class="dept-name">{{ dept.department }}</span>
                <span class="rate-badge" [class.high]="dept.complianceRate >= 85" [class.med]="dept.complianceRate < 85 && dept.complianceRate >= 80" [class.low]="dept.complianceRate < 80">
                  {{ dept.complianceRate }}%
                </span>
              </div>
              <div class="dept-meta">
                <span>ผ่าน {{ dept.compliantEmployees }}/{{ dept.totalEmployees }} คน</span>
                <span>💎 {{ dept.avgXp | number }} XP</span>
              </div>
              <div class="dept-bar">
                <div class="dept-fill" [style.width.%]="dept.complianceRate" [class.high]="dept.complianceRate >= 85" [class.med]="dept.complianceRate < 85 && dept.complianceRate >= 80" [class.low]="dept.complianceRate < 80"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .metric-card {
      position: relative;
      background: var(--sic-color-bg, #ffffff);
      border-radius: 16px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
        border-color: var(--sic-color-primary, #00a887);
      }
    }

    .card-glow {
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.15;
      pointer-events: none;
    }

    .metric-card.primary .card-glow { background: #00a887; }
    .metric-card.emerald .card-glow { background: #10b981; }
    .metric-card.teal .card-glow { background: #06b6d4; }
    .metric-card.amber .card-glow { background: #f59e0b; }
    .metric-card.purple .card-glow { background: #8b5cf6; }
    .metric-card.blue .card-glow { background: #3b82f6; }

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .metric-icon {
      font-size: 1.6rem;
      line-height: 1;
    }

    .trend-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;

      &.positive { background: rgba(16, 185, 129, 0.12); color: #059669; }
      &.neutral { background: rgba(100, 116, 139, 0.12); color: #475569; }
      &.gold { background: rgba(245, 158, 11, 0.15); color: #d97706; }
    }

    .metric-val {
      font-size: 1.75rem;
      font-weight: 900;
      color: var(--sic-color-text-active, #0f172a);
      line-height: 1.2;
      margin-bottom: 0.25rem;
      font-family: inherit;
    }

    .metric-lbl {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--sic-color-text-muted, #64748b);
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }

    .metric-sub {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #94a3b8);
      margin-top: auto;
    }

    .progress-track {
      height: 6px;
      background: var(--sic-color-border, #e2e8f0);
      border-radius: 9999px;
      overflow: hidden;
      margin-top: auto;
    }

    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.6s ease;

      &.primary { background: linear-gradient(90deg, #00a887, #10b981); }
      &.emerald { background: linear-gradient(90deg, #10b981, #34d399); }
      &.teal { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
    }

    /* Department Summary Card */
    .dept-summary-card {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 1.5rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
    }

    .dept-header {
      margin-bottom: 1.25rem;
    }

    .dept-title-group {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;

      .dept-icon {
        font-size: 1.6rem;
        background: rgba(0, 168, 135, 0.1);
        padding: 0.4rem;
        border-radius: 10px;
      }

      h3 {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--sic-color-text-active, #0f172a);
        margin: 0 0 0.2rem 0;
      }

      p {
        font-size: 0.85rem;
        color: var(--sic-color-text-muted, #64748b);
        margin: 0;
      }
    }

    .dept-chips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .dept-item-card {
      background: var(--sic-color-surface-hover, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .dept-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .dept-emoji { font-size: 1.1rem; }

    .dept-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rate-badge {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 6px;

      &.high { background: rgba(16, 185, 129, 0.15); color: #059669; }
      &.med { background: rgba(245, 158, 11, 0.15); color: #d97706; }
      &.low { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
    }

    .dept-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .dept-bar {
      height: 4px;
      background: var(--sic-color-border, #e2e8f0);
      border-radius: 9999px;
      overflow: hidden;
    }

    .dept-fill {
      height: 100%;
      border-radius: 9999px;

      &.high { background: #10b981; }
      &.med { background: #f59e0b; }
      &.low { background: #ef4444; }
    }

    @media (max-width: 768px) {
      .metric-grid {
        grid-template-columns: 1fr;
      }
      .dept-chips-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminKpiSummaryComponent {
  private readonly adminService = inject(AdminService);
  readonly metrics = this.adminService.kpiMetrics;
  readonly departments = this.adminService.departments;
}

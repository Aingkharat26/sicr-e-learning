import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService } from '../../core/services/courses.service';
import { QuizService } from '../../core/services/quiz.service';
import { CertificateService } from '../../core/services/certificate.service';
import { CertificateViewerComponent } from './certificate-viewer.component';
import { Course } from '../../core/models/course.model';
import { Certificate } from '../../core/models/certificate.model';

@Component({
  selector: 'app-my-learning',
  standalone: true,
  imports: [CommonModule, RouterModule, CertificateViewerComponent],
  template: `
    <div class="my-learning-container">
      <!-- User Profile & Metric Header -->
      <section class="profile-hero-section">
        <div class="profile-card">
          <div class="profile-avatar-wrapper">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Aingkharat Srithong"
              class="profile-avatar"
            />
            <span class="role-badge">Level 4 • Pro Learner</span>
          </div>
          <div class="profile-info">
            <div class="name-row">
              <h1 class="user-name">อิงครัต ศรีทอง (Aingkharat Srithong)</h1>
              <span class="dept-tag">💻 Software Engineering & AI</span>
            </div>
            <p class="user-position">Senior Frontend & Mobile Engineer • Soft Inter Chiangrai</p>
            <div class="overall-progress-bar-wrap">
              <div class="progress-label-row">
                <span>ความก้าวหน้าการเรียนรู้รายปี 2026</span>
                <span class="progress-val">78% ของเป้าหมายองค์กร</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width: 78%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4 Key Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card in-progress-card">
            <div class="metric-icon">🚀</div>
            <div class="metric-data">
              <span class="metric-num">{{ inProgressCourses().length }}</span>
              <span class="metric-label">คอร์สที่กำลังเรียน</span>
            </div>
          </div>

          <div class="metric-card completed-card">
            <div class="metric-icon">🎓</div>
            <div class="metric-data">
              <span class="metric-num">{{ completedCourses().length }}</span>
              <span class="metric-label">สำเร็จหลักสูตรแล้ว</span>
            </div>
          </div>

          <div class="metric-card cert-card">
            <div class="metric-icon">📜</div>
            <div class="metric-data">
              <span class="metric-num">{{ certificateService.certificates().length }}</span>
              <span class="metric-label">ใบประกาศนียบัตร</span>
            </div>
          </div>

          <div class="metric-card xp-card">
            <div class="metric-icon">⚡</div>
            <div class="metric-data">
              <span class="metric-num">{{ totalEarnedXp() }}</span>
              <span class="metric-label">แต้ม XP สะสม</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Navigation Tabs -->
      <div class="tabs-navigation">
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'in_progress'"
          (click)="setTab('in_progress')"
        >
          <span class="tab-icon">📖</span>
          <span>กำลังเรียนอยู่</span>
          <span class="tab-badge">{{ inProgressCourses().length }}</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="activeTab() === 'completed'"
          (click)="setTab('completed')"
        >
          <span class="tab-icon">🏆</span>
          <span>สำเร็จการศึกษา & ประกาศนียบัตร</span>
          <span class="tab-badge cert-badge">{{ completedCourses().length }}</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="activeTab() === 'quizzes'"
          (click)="setTab('quizzes')"
        >
          <span class="tab-icon">📝</span>
          <span>ประวัติการสอบประเมิน</span>
          <span class="tab-badge">{{ quizAttemptsList().length }}</span>
        </button>
      </div>

      <!-- Tab Content 1: In Progress Courses -->
      @if (activeTab() === 'in_progress') {
        <div class="tab-pane">
          @if (inProgressCourses().length > 0) {
            <div class="courses-flow-grid">
              @for (course of inProgressCourses(); track course.id) {
                <div class="course-flow-card">
                  <div class="course-thumb-box">
                    <img [src]="course.thumbnail" [alt]="course.title" class="thumb-img" />
                    <span class="category-pill">{{ course.category }}</span>
                    @if (course.isMandatory) {
                      <span class="mandatory-pill">คอร์สบังคับ</span>
                    }
                  </div>

                  <div class="course-flow-content">
                    <div class="course-title-block">
                      <h3 class="course-title">{{ course.title }}</h3>
                      @if (course.thaiTitle) {
                        <p class="course-thai">{{ course.thaiTitle }}</p>
                      }
                    </div>

                    <div class="instructor-mini">
                      <img [src]="course.instructor.avatar" [alt]="course.instructor.name" class="inst-avatar" />
                      <span class="inst-name">{{ course.instructor.thaiName }}</span>
                      <span class="inst-dot">•</span>
                      <span class="inst-dur">⏱️ {{ course.duration }}</span>
                    </div>

                    <!-- Progress Bar & Next Lesson -->
                    <div class="progress-status-box">
                      <div class="progress-header">
                        <span class="progress-title">ความคืบหน้าการเรียน</span>
                        <span class="progress-percentage">{{ course.userProgressPercent }}%</span>
                      </div>
                      <div class="custom-progress-track">
                        <div class="custom-progress-fill" [style.width.%]="course.userProgressPercent"></div>
                      </div>
                      @if (course.lastAccessedLessonTitle) {
                        <p class="last-lesson-hint">
                          <span class="hint-label">บทเรียนล่าสุด:</span> {{ course.lastAccessedLessonTitle }}
                        </p>
                      }
                    </div>

                    <!-- Action Buttons -->
                    <div class="card-action-footer">
                      <a [routerLink]="['/courses', course.id, 'learn']" class="btn-resume">
                        <span>▶</span>
                        <span>เรียนต่อทันที</span>
                      </a>
                      <a [routerLink]="['/courses', course.id]" class="btn-detail">
                        <span>รายละเอียดคอร์ส</span>
                      </a>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state-box">
              <div class="empty-icon">🎒</div>
              <h3>ยังไม่มีหลักสูตรที่กำลังเรียนอยู่</h3>
              <p>เลือกหลักสูตรที่สนใจในแคตตาล็อกเพื่อเริ่มต้นพัฒนาทักษะใหม่กับทีม SICR</p>
              <a routerLink="/courses" class="btn-browse-courses">สำรวจหลักสูตรทั้งหมด →</a>
            </div>
          }
        </div>
      }

      <!-- Tab Content 2: Completed Courses & Certificates -->
      @if (activeTab() === 'completed') {
        <div class="tab-pane">
          @if (completedCourses().length > 0) {
            <div class="completed-courses-grid">
              @for (course of completedCourses(); track course.id) {
                <div class="completed-card-item">
                  <div class="ribbon-completed">
                    <span>✓ สำเร็จ 100%</span>
                  </div>
                  <div class="completed-card-thumb">
                    <img [src]="course.thumbnail" [alt]="course.title" />
                    <span class="cert-avail-tag">📜 Certificate Verified</span>
                  </div>

                  <div class="completed-card-body">
                    <span class="comp-cat">{{ course.category }}</span>
                    <h3 class="comp-title">{{ course.title }}</h3>
                    @if (course.thaiTitle) {
                      <p class="comp-thai">{{ course.thaiTitle }}</p>
                    }

                    <div class="comp-stats-row">
                      <div class="comp-stat">
                        <span class="comp-stat-icon">⚡</span>
                        <span>ได้รับ <strong>+{{ course.xpAward }} XP</strong></span>
                      </div>
                      <div class="comp-stat">
                        <span class="comp-stat-icon">⏱️</span>
                        <span>เวลาเรียน <strong>{{ course.duration }}</strong></span>
                      </div>
                    </div>

                    <div class="comp-action-btns">
                      <button class="btn-view-cert" (click)="viewCertificateForCourse(course)">
                        <span class="btn-icon">📜</span>
                        <span>ดูใบประกาศนียบัตร (Certificate)</span>
                      </button>
                      <a [routerLink]="['/courses', course.id, 'learn']" class="btn-review-course">
                        <span>🔄 ทบทวนบทเรียน</span>
                      </a>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state-box">
              <div class="empty-icon">🏆</div>
              <h3>ยังไม่มีหลักสูตรที่สำเร็จการศึกษา</h3>
              <p>เรียนบทเรียนให้ครบ 100% และทำแบบทดสอบให้ผ่านเกณฑ์ 80% เพื่อรับใบประกาศนียบัตรดิจิทัล</p>
            </div>
          }
        </div>
      }

      <!-- Tab Content 3: Quiz History -->
      @if (activeTab() === 'quizzes') {
        <div class="tab-pane">
          <div class="quiz-history-wrapper">
            <div class="quiz-history-header">
              <h3>บันทึกประวัติการทำแบบทดสอบและวัดผล</h3>
              <p>ประวัติการทำข้อสอบทั้งหมดเพื่อประเมินความรู้และออกใบรับรอง</p>
            </div>

            <div class="quiz-history-table-wrap">
              <table class="quiz-table">
                <thead>
                  <tr>
                    <th>แบบทดสอบ / หลักสูตร</th>
                    <th>คะแนนที่ได้</th>
                    <th>ผลการประเมิน</th>
                    <th>เวลาที่ใช้</th>
                    <th>วันที่ส่งข้อสอบ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  @for (attempt of quizAttemptsList(); track attempt.quizId) {
                    <tr>
                      <td class="quiz-name-cell">
                        <div class="quiz-icon-title">
                          <span class="q-icon">📝</span>
                          <div>
                            <div class="q-title">{{ attempt.quizTitle }}</div>
                            <div class="q-course">{{ attempt.courseTitle }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="score-cell">
                        <strong [class.text-pass]="attempt.isPassed" [class.text-fail]="!attempt.isPassed">
                          {{ attempt.score }} / {{ attempt.maxScore }} ({{ attempt.percent }}%)
                        </strong>
                      </td>
                      <td>
                        @if (attempt.isPassed) {
                          <span class="status-pill pass">✓ ผ่านเกณฑ์ (Passed)</span>
                        } @else {
                          <span class="status-pill fail">✕ ไม่ผ่านเกณฑ์</span>
                        }
                      </td>
                      <td>{{ attempt.timeSpentFormatted }}</td>
                      <td class="date-cell">{{ attempt.dateFormatted }}</td>
                      <td>
                        <a [routerLink]="['/courses', attempt.courseId, 'quiz', attempt.quizId]" class="btn-table-review">
                          🔎 ดูเฉลย / สอบใหม่
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Certificate Viewer Modal -->
    @if (certificateService.activeCertificate(); as cert) {
      <app-certificate-viewer
        [certificate]="cert"
        (close)="certificateService.closeCertificate()"
      ></app-certificate-viewer>
    }
  `,
  styles: [`
    .my-learning-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem 1.5rem;
      min-height: calc(100vh - 80px);
    }

    /* Profile & Metric Hero */
    .profile-hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2.25rem;
    }

    .profile-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      padding: 1.75rem;
      display: flex;
      gap: 1.5rem;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }

    .profile-avatar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .profile-avatar {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #00a887;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.2);
    }

    .role-badge {
      font-size: 0.7rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00a887 0%, #065f46 100%);
      color: #ffffff;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      white-space: nowrap;
    }

    .profile-info {
      flex: 1;
      min-width: 0;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .user-name {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0;
    }

    .dept-tag {
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      white-space: nowrap;
    }

    .user-position {
      font-size: 0.875rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0.35rem 0 1rem 0;
    }

    .overall-progress-bar-wrap {
      background: var(--sic-color-surface, rgba(0, 0, 0, 0.02));
      border-radius: 10px;
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .progress-label-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--sic-color-text-muted, #64748b);
      margin-bottom: 0.4rem;
    }

    .progress-val {
      color: #00a887;
      font-weight: 700;
    }

    .bar-track {
      height: 7px;
      background: var(--sic-color-border, #e2e8f0);
      border-radius: 9999px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #00a887 0%, #10b981 100%);
      border-radius: 9999px;
    }

    /* 4 Metric Cards Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .metric-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      transition: transform 0.2s;
    }
    .metric-card:hover {
      transform: translateY(-2px);
    }

    .metric-icon {
      font-size: 2.2rem;
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 168, 135, 0.08);
      flex-shrink: 0;
    }

    .in-progress-card .metric-icon { background: rgba(59, 130, 246, 0.1); }
    .completed-card .metric-icon { background: rgba(16, 185, 129, 0.1); }
    .cert-card .metric-icon { background: rgba(245, 158, 11, 0.1); }
    .xp-card .metric-icon { background: rgba(139, 92, 246, 0.1); }

    .metric-data {
      display: flex;
      flex-direction: column;
    }

    .metric-num {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      line-height: 1.1;
    }

    .metric-label {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 600;
      margin-top: 0.2rem;
    }

    /* Tabs Navigation */
    .tabs-navigation {
      display: flex;
      gap: 0.75rem;
      border-bottom: 2px solid var(--sic-color-border, #e2e8f0);
      margin-bottom: 2rem;
      padding-bottom: 0.5rem;
      overflow-x: auto;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      background: transparent;
      border: none;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: #00a887;
      background: rgba(0, 168, 135, 0.05);
    }

    .tab-btn.active {
      color: #ffffff;
      background: #00a887;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.25);
    }

    .tab-badge {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background: var(--sic-color-surface-hover, rgba(0, 0, 0, 0.08));
      color: var(--sic-color-text-muted, #64748b);
    }

    .tab-btn.active .tab-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    /* Tab 1: In Progress Courses Flow */
    .courses-flow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
      gap: 1.5rem;
    }

    .course-flow-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .course-flow-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    }

    .course-thumb-box {
      height: 180px;
      position: relative;
      overflow: hidden;
    }

    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .category-pill {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.3rem 0.65rem;
      border-radius: 8px;
    }

    .mandatory-pill {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #ef4444;
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.25rem 0.6rem;
      border-radius: 8px;
    }

    .course-flow-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .course-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.35rem 0;
      line-height: 1.35;
    }

    .course-thai {
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
    }

    .instructor-mini {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .inst-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .progress-status-box {
      background: rgba(0, 168, 135, 0.04);
      border: 1px solid rgba(0, 168, 135, 0.15);
      border-radius: 12px;
      padding: 1rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .progress-title { color: var(--sic-color-text-active, #0f172a); }
    .progress-percentage { color: #00a887; font-size: 0.9rem; }

    .custom-progress-track {
      height: 8px;
      background: rgba(0, 0, 0, 0.08);
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .custom-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00a887 0%, #10b981 100%);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .last-lesson-hint {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hint-label {
      font-weight: 700;
      color: #00a887;
    }

    .card-action-footer {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .btn-resume {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      background: #00a887;
      color: #ffffff;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-resume:hover {
      background: #008f72;
      transform: translateY(-1px);
    }

    .btn-detail {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--sic-color-surface, #f1f5f9);
      color: var(--sic-color-text-active, #0f172a);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-detail:hover {
      background: var(--sic-color-surface-hover, #e2e8f0);
      color: var(--sic-color-text-active, #0f172a);
      border-color: var(--sic-color-border, #cbd5e1);
    }

    /* Tab 2: Completed Courses */
    .completed-courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .completed-card-item {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
    }

    .ribbon-completed {
      position: absolute;
      top: 14px;
      right: -32px;
      background: #10b981;
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.3rem 2.5rem;
      transform: rotate(45deg);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
      z-index: 10;
    }

    .completed-card-thumb {
      height: 160px;
      position: relative;
    }

    .completed-card-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cert-avail-tag {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(4px);
      color: #fcd34d;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
    }

    .completed-card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
      gap: 1rem;
    }

    .comp-cat {
      font-size: 0.75rem;
      font-weight: 700;
      color: #00a887;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .comp-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0.2rem 0;
    }

    .comp-thai {
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
    }

    .comp-stats-row {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      background: var(--sic-color-surface, rgba(0, 0, 0, 0.02));
      border: 1px solid var(--sic-color-border, transparent);
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
    }

    .comp-action-btns {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-view-cert {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #00a887 0%, #008f72 100%);
      color: #ffffff;
      padding: 0.8rem 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.25);
      transition: all 0.2s;
    }
    .btn-view-cert:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 168, 135, 0.35);
    }

    .btn-review-course {
      text-align: center;
      color: var(--sic-color-text-muted, #64748b);
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      padding: 0.4rem;
    }
    .btn-review-course:hover {
      color: #00a887;
    }

    /* Tab 3: Quiz History */
    .quiz-history-wrapper {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      padding: 1.75rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }

    .quiz-history-header h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.35rem 0;
    }

    .quiz-history-header p {
      font-size: 0.875rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0 0 1.5rem 0;
    }

    .quiz-history-table-wrap {
      overflow-x: auto;
    }

    .quiz-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .quiz-table th {
      background: var(--sic-color-surface, rgba(0, 0, 0, 0.02));
      padding: 0.875rem 1rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      border-bottom: 2px solid var(--sic-color-border, #e2e8f0);
      white-space: nowrap;
    }

    .quiz-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      vertical-align: middle;
    }

    .quiz-icon-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .q-icon { font-size: 1.4rem; }

    .q-title {
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin-bottom: 0.15rem;
    }

    .q-course {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .text-pass { color: #10b981; }
    .text-fail { color: #ef4444; }

    .status-pill {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      white-space: nowrap;
    }

    .status-pill.pass {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .status-pill.fail {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .btn-table-review {
      display: inline-block;
      padding: 0.4rem 0.8rem;
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .btn-table-review:hover {
      background: #00a887;
      color: #ffffff;
    }

    /* Empty State */
    .empty-state-box {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--sic-color-bg, #ffffff);
      border-radius: 20px;
      border: 1px dashed var(--sic-color-border, #cbd5e1);
    }

    .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }

    .empty-state-box h3 {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.5rem 0;
    }

    .empty-state-box p {
      color: var(--sic-color-text-muted, #64748b);
      font-size: 0.95rem;
      max-width: 500px;
      margin: 0 auto 1.5rem auto;
    }

    .btn-browse-courses {
      display: inline-block;
      background: #00a887;
      color: #ffffff;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-browse-courses:hover {
      background: #008f72;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .profile-hero-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .my-learning-container {
        padding: 1rem;
      }
      .profile-card {
        flex-direction: column;
        text-align: center;
      }
      .name-row {
        justify-content: center;
      }
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      .courses-flow-grid,
      .completed-courses-grid {
        grid-template-columns: 1fr;
      }
      .card-action-footer {
        flex-direction: column;
      }
      .btn-resume, .btn-detail {
        width: 100%;
      }
    }
  `]
})
export class MyLearningComponent {
  private readonly coursesService = inject(CoursesService);
  private readonly quizService = inject(QuizService);
  readonly certificateService = inject(CertificateService);

  readonly activeTab = signal<'in_progress' | 'completed' | 'quizzes'>('in_progress');

  readonly inProgressCourses = computed(() =>
    this.coursesService.courses().filter((c) => c.enrolledStatus === 'in_progress')
  );

  readonly completedCourses = computed(() =>
    this.coursesService.courses().filter((c) => c.enrolledStatus === 'completed')
  );

  readonly totalEarnedXp = computed(() => {
    return this.completedCourses().reduce((sum, c) => sum + (c.xpAward || 0), 450);
  });

  readonly quizAttemptsList = computed(() => {
    const attempts = this.quizService.attempts();
    const result = [
      {
        quizId: 'quiz-003',
        quizTitle: 'SICR Onboarding & IT Security Assessment',
        courseId: 'crs-003',
        courseTitle: 'SICR Employee Onboarding & Culture Guideline',
        score: 50,
        maxScore: 50,
        percent: 100,
        isPassed: true,
        timeSpentFormatted: '4 นาที 15 วินาที',
        dateFormatted: '15 ส.ค. 2026',
      },
      {
        quizId: 'quiz-001',
        quizTitle: 'Signals Foundation & Reactivity Assessment',
        courseId: 'crs-001',
        courseTitle: 'Angular 22 Enterprise Architecture & Zoneless Signals',
        score: 45,
        maxScore: 50,
        percent: 90,
        isPassed: true,
        timeSpentFormatted: '5 นาที 40 วินาที',
        dateFormatted: '19 ส.ค. 2026',
      },
    ];

    // Merge any live attempts from service
    Object.values(attempts).forEach((att) => {
      const existing = result.find((r) => r.quizId === att.quizId);
      const quiz = this.quizService.getQuizById(att.quizId);
      const course = quiz ? this.coursesService.getCourseById(quiz.courseId) : undefined;
      const mins = Math.floor(att.timeSpentSeconds / 60);
      const secs = att.timeSpentSeconds % 60;

      if (!existing && quiz) {
        result.unshift({
          quizId: att.quizId,
          quizTitle: quiz.title,
          courseId: quiz.courseId,
          courseTitle: course?.title || 'Course Assessment',
          score: att.score,
          maxScore: att.maxScore,
          percent: att.percent,
          isPassed: att.isPassed,
          timeSpentFormatted: `${mins} นาที ${secs} วินาที`,
          dateFormatted: 'วันนี้',
        });
      }
    });

    return result;
  });

  setTab(tab: 'in_progress' | 'completed' | 'quizzes'): void {
    this.activeTab.set(tab);
  }

  viewCertificateForCourse(course: Course): void {
    const cert = this.certificateService.generateCertificateForCourse(course);
    this.certificateService.openCertificate(cert);
  }
}

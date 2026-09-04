import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CoursesService } from '../../core/services/courses.service';
import { KmService } from '../../core/services/km.service';
import { Course } from '../../core/models/course.model';
import { KmArticle } from '../../core/models/km.model';

interface ActivityItem {
  id: string;
  avatar: string;
  userName: string;
  action: string;
  targetTitle: string;
  targetRoute: string;
  timeAgo: string;
  icon: string;
  xpEarned?: number;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  thaiName: string;
  avatar: string;
  role: string;
  department: string;
  xp: number;
  completedCourses: number;
  badge: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <!-- 1. Hero Welcome Banner & Personal Learning Overview -->
      <section class="hero-section">
        <div class="hero-glow-bg"></div>
        <div class="hero-content">
          <div class="hero-top-row">
            <div class="hero-badge">
              <span class="pulse-dot"></span>
              <span>Soft Inter Chiangrai • Learning & Knowledge Platform</span>
            </div>
            <div class="current-date-badge">
              <span>📅 วันนี้: {{ currentDateFormatted }}</span>
            </div>
          </div>

          <div class="hero-main-flex">
            <div class="hero-text-col">
              <h1 class="hero-title">
                ยินดีต้อนรับสู่ <span class="highlight">SICR E-LEARNING</span>
              </h1>
              <p class="hero-subtitle">
                ศูนย์กลางการพัฒนาทักษะวิชาชีพ เทคโนโลยีล้ำสมัย และคลังปัญญาความรู้ (KM)
                เพื่อยกระดับศักยภาพบุคลากร <strong>Soft Inter Chiangrai</strong> สู่ระดับสากล
              </p>
            </div>

            <!-- Quick Action Jump Buttons -->
            <div class="hero-actions-col">
              @if (inProgressCourses().length > 0) {
                <a [routerLink]="['/courses', inProgressCourses()[0].slug || inProgressCourses()[0].id, 'learn']" class="hero-action-btn primary-pulse">
                  <span class="btn-icon">▶</span>
                  <span class="btn-text">
                    <strong>เรียนต่อทันที</strong>
                    <small>{{ inProgressCourses()[0].title | slice:0:28 }}...</small>
                  </span>
                </a>
              } @else {
                <a routerLink="/courses" class="hero-action-btn primary">
                  <span class="btn-icon">🎓</span>
                  <span class="btn-text">
                    <strong>เริ่มค้นหาหลักสูตร</strong>
                    <small>เลือกคอร์สที่สนใจเรียนฟรี</small>
                  </span>
                </a>
              }
              <a routerLink="/km" class="hero-action-btn secondary">
                <span class="btn-icon">💡</span>
                <span class="btn-text">
                  <strong>เปิดคลังความรู้ KM</strong>
                  <small>Wiki คู่มือ & Tech Standards</small>
                </span>
              </a>
            </div>
          </div>

          <!-- User Personal Learning & Daily Streak Bar -->
          <div class="user-greeting-card">
            <div class="user-profile-meta">
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
            </div>

            <!-- Learning Streak & Daily Goal Widget -->
            <div class="learning-streak-widget">
              <div class="streak-header">
                <div class="streak-badge">
                  <span class="fire-icon">🔥</span>
                  <strong>5 วันต่อเนื่อง!</strong> (Active Streak)
                </div>
                <span class="daily-goal-text">เป้าหมายประจำวัน: <strong>35/45 นาที</strong> (78%)</span>
              </div>
              <div class="streak-days-row">
                <div class="day-chip done" title="วันจันทร์ - สำเร็จ"><span>จ</span><span class="check">✓</span></div>
                <div class="day-chip done" title="วันอังคาร - สำเร็จ"><span>อ</span><span class="check">✓</span></div>
                <div class="day-chip done" title="วันพุธ - สำเร็จ"><span>พ</span><span class="check">✓</span></div>
                <div class="day-chip done" title="วันพฤหัสบดี - สำเร็จ"><span>พฤ</span><span class="check">✓</span></div>
                <div class="day-chip active" title="วันศุกร์ (วันนี้) - กำลังเรียน"><span>ศ</span><span class="check">●</span></div>
                <div class="day-chip pending" title="วันเสาร์"><span>ส</span></div>
                <div class="day-chip pending" title="วันอาทิตย์"><span>อา</span></div>
              </div>
            </div>

            <!-- Quick Stats Metrics -->
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
                <span class="stat-num">{{ user().xpPoints | number }}</span>
                <span class="stat-label">⚡ XP สะสม</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Mandatory & Compliance Alert Banner (If Applicable) -->
      @if (mandatoryCourse()) {
        <section class="compliance-alert-section">
          <div class="compliance-alert-card">
            <div class="compliance-icon-wrap">
              <span class="alert-icon">⚠️</span>
            </div>
            <div class="compliance-info">
              <div class="compliance-header-tag">
                <span class="badge-mandatory">🔴 หลักสูตรบังคับประจำปี (Mandatory Course)</span>
                <span class="due-date">⏰ กำหนดส่งภายใน 31 ส.ค. 2026</span>
              </div>
              <h3 class="compliance-title">{{ mandatoryCourse()?.title }}</h3>
              <p class="compliance-desc">
                {{ mandatoryCourse()?.description | slice:0:150 }}...
              </p>
            </div>
            <div class="compliance-action">
              <a [routerLink]="['/courses', mandatoryCourse()?.slug || mandatoryCourse()?.id, 'learn']" class="compliance-btn">
                <span>▶ เริ่มเรียนทันที</span>
              </a>
            </div>
          </div>
        </section>
      }

      <!-- 3. In-Progress Courses (Quick Resume Learning) -->
      @if (inProgressCourses().length > 0) {
        <section class="dashboard-section in-progress-section">
          <div class="section-title-row">
            <div>
              <h2 class="section-heading">
                <span class="heading-icon">📖</span> สานต่อการเรียนรู้ (Continue Learning)
              </h2>
              <p class="section-subtext">หลักสูตรที่คุณกำลังศึกษาอยู่ สามารถคลิกเพื่อเข้าสู่ห้องเรียนต่อได้ทันที</p>
            </div>
            <a routerLink="/my-learning" class="view-all-link">ดูทั้งหมดในการเรียนของฉัน →</a>
          </div>

          <div class="in-progress-grid">
            @for (course of inProgressCourses(); track course.id) {
              <div class="resume-card">
                <div class="resume-cover-wrap">
                  <img [src]="course.thumbnail" [alt]="course.title" class="resume-cover" />
                  <span class="resume-level-tag">{{ course.level }}</span>
                </div>
                <div class="resume-content">
                  <div class="resume-category">{{ course.category }}</div>
                  <h3 class="resume-title">
                    <a [routerLink]="['/courses', course.slug || course.id]">{{ course.title }}</a>
                  </h3>
                  <div class="resume-meta">
                    <span>👨‍🏫 {{ course.instructor.thaiName }}</span>
                    <span>⚡ +{{ course.xpAward }} XP</span>
                  </div>
                  <!-- Progress Bar -->
                  <div class="resume-progress-wrap">
                    <div class="progress-info">
                      <span>ความคืบหน้า</span>
                      <strong>{{ course.userProgressPercent }}%</strong>
                    </div>
                    <div class="progress-track">
                      <div class="progress-bar" [style.width.%]="course.userProgressPercent"></div>
                    </div>
                  </div>
                  <!-- Actions -->
                  <div class="resume-actions">
                    <a [routerLink]="['/courses', course.slug || course.id, 'learn']" class="btn-resume-primary">
                      ▶ เข้าห้องเรียน
                    </a>
                    <a [routerLink]="['/courses', course.slug || course.id]" class="btn-resume-outline">
                      โครงสร้างวิชา
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- 4. Recommended Courses Section -->
      <section class="dashboard-section recommended-section">
        <div class="section-title-row">
          <div>
            <h2 class="section-heading">
              <span class="heading-icon">✨</span> หลักสูตรแนะนำสำหรับคุณ (Recommended Courses)
            </h2>
            <p class="section-subtext">คัดสรรหลักสูตรยอดนิยมและทักษะเทคโนโลยีที่ตอบโจทย์ทีมวิศวกรรมและการทำงานยุคใหม่</p>
          </div>
          <a routerLink="/courses" class="view-all-link">ดูแคตตาล็อกทั้งหมด ({{ totalCourses() }} คอร์ส) →</a>
        </div>

        <div class="recommended-grid">
          @for (course of recommendedCourses(); track course.id) {
            <div class="course-mini-card">
              <div class="mini-card-cover-wrap">
                <img [src]="course.thumbnail" [alt]="course.title" class="mini-card-cover" />
                <span class="category-badge">{{ course.category }}</span>
                @if (course.isMandatory) {
                  <span class="mandatory-pill">บังคับ</span>
                }
              </div>
              <div class="mini-card-body">
                <div class="card-meta-row">
                  <span class="rating-badge">⭐ {{ course.rating.toFixed(1) }}</span>
                  <span class="duration-badge">⏱️ {{ course.duration }}</span>
                  <span class="xp-badge">⚡ {{ course.xpAward }} XP</span>
                </div>
                <h3 class="mini-card-title">
                  <a [routerLink]="['/courses', course.slug || course.id]">{{ course.title }}</a>
                </h3>
                <p class="mini-card-desc">{{ course.description | slice:0:90 }}...</p>
                
                <div class="mini-card-footer">
                  <div class="instructor-info">
                    <img [src]="course.instructor.avatar" [alt]="course.instructor.name" class="inst-avatar" />
                    <span>{{ course.instructor.thaiName }}</span>
                  </div>
                  <a [routerLink]="['/courses', course.slug || course.id]" class="btn-view-course">
                    ดูคอร์ส →
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 5. Featured KM Knowledge Section -->
      <section class="dashboard-section km-featured-section">
        <div class="section-title-row">
          <div>
            <h2 class="section-heading">
              <span class="heading-icon">💡</span> คลังความรู้เด่นประจำสัปดาห์ (Featured Knowledge & Wiki)
            </h2>
            <p class="section-subtext">เอกสารมาตรฐานทางเทคนิค คู่มือปฏิบัติงาน และ Best Practices จากเพื่อนร่วมงาน</p>
          </div>
          <a routerLink="/km" class="view-all-link">เปิดคลัง KM Hub →</a>
        </div>

        <div class="km-articles-grid">
          @for (article of featuredArticles(); track article.id) {
            <div class="km-article-card">
              <div class="km-card-top">
                <span class="km-space-pill" [ngClass]="'space-' + article.spaceId">
                  {{ getSpaceName(article.spaceId) }}
                </span>
                <span class="km-read-time">⏱️ {{ article.readTimeMinutes }} นาที</span>
              </div>
              <h3 class="km-article-title">
                <a [routerLink]="['/km', article.slug || article.id]">{{ article.title }}</a>
              </h3>
              <p class="km-article-summary">{{ article.summary | slice:0:110 }}...</p>
              
              <div class="km-tags-row">
                @for (tag of article.tags | slice:0:3; track tag) {
                  <span class="km-tag">#{{ tag }}</span>
                }
              </div>

              <div class="km-card-bottom">
                <div class="km-author">
                  <img [src]="article.author.avatarUrl" [alt]="article.author.name" class="km-author-img" />
                  <div class="km-author-text">
                    <strong>{{ article.author.name }}</strong>
                    <small>{{ article.author.department }}</small>
                  </div>
                </div>
                <div class="km-metrics">
                  <span>👁️ {{ article.views }}</span>
                  <span>❤️ {{ article.likes }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 6. 2-Column: Live Social Activity Feed & XP Leaderboard -->
      <section class="dashboard-section community-section">
        <div class="community-grid">
          <!-- Left Col: Live Activity Feed -->
          <div class="community-col activity-col">
            <div class="col-header">
              <h3 class="col-title">
                <span class="col-icon">⚡</span> กิจกรรมการเรียนรู้ล่าสุด (Live Activity)
              </h3>
              <span class="live-indicator"><span class="green-dot"></span> อัปเดตแบบเรียลไทม์</span>
            </div>
            <div class="activity-feed-list">
              @for (act of liveActivities(); track act.id) {
                <div class="activity-item">
                  <img [src]="act.avatar" [alt]="act.userName" class="activity-avatar" />
                  <div class="activity-details">
                    <div class="activity-text">
                      <strong>{{ act.userName }}</strong> {{ act.action }}
                      <a [routerLink]="act.targetRoute" class="activity-link">"{{ act.targetTitle }}"</a>
                    </div>
                    <div class="activity-time-row">
                      <span class="activity-time">🕒 {{ act.timeAgo }}</span>
                      @if (act.xpEarned) {
                        <span class="activity-xp">+{{ act.xpEarned }} XP</span>
                      }
                    </div>
                  </div>
                  <span class="activity-badge-icon">{{ act.icon }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Right Col: Top Learners Leaderboard -->
          <div class="community-col leaderboard-col">
            <div class="col-header">
              <h3 class="col-title">
                <span class="col-icon">🏆</span> ผู้เรียนยอดเยี่ยมประจำเดือน (Top XP Leaderboard)
              </h3>
              <span class="month-tag">สิงหาคม 2026</span>
            </div>
            <div class="leaderboard-list">
              @for (lb of leaderboardUsers(); track lb.rank) {
                <div class="leaderboard-row" [class.current-user-row]="lb.thaiName === user().thaiName">
                  <div class="rank-badge" [ngClass]="'rank-' + lb.rank">
                    @if (lb.rank === 1) { 🥇 }
                    @else if (lb.rank === 2) { 🥈 }
                    @else if (lb.rank === 3) { 🥉 }
                    @else { #{{ lb.rank }} }
                  </div>
                  <img [src]="lb.avatar" [alt]="lb.name" class="lb-avatar" />
                  <div class="lb-info">
                    <div class="lb-name-row">
                      <strong>{{ lb.thaiName }}</strong>
                      @if (lb.thaiName === user().thaiName) {
                        <span class="you-pill">คุณ</span>
                      }
                    </div>
                    <span class="lb-dept">{{ lb.role }} • {{ lb.department }}</span>
                  </div>
                  <div class="lb-xp-col">
                    <span class="lb-xp-num">{{ lb.xp | number }}</span>
                    <span class="lb-xp-label">XP</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- 7. Core System Modules Hub -->
      <section class="dashboard-section modules-section">
        <div class="section-title-row">
          <div>
            <h2 class="section-heading">
              <span class="heading-icon">🚀</span> เข้าถึงระบบย่อยทั้งหมด (Core Modules Directory)
            </h2>
            <p class="section-subtext">เลือกเข้าใช้งานโมดูลต่างๆ ของ SICR E-LEARNING & KM ได้อย่างสะดวกรวดเร็ว</p>
          </div>
        </div>

        <div class="module-cards-grid">
          <!-- Card 1: LMS E-Learning -->
          <div class="module-card card-lms">
            <div class="card-icon-wrapper lms-icon">
              🎓
            </div>
            <div class="card-body">
              <div class="module-tag tag-lms">LMS MODULE</div>
              <h3 class="card-title">แคตตาล็อกหลักสูตร (Course Catalog)</h3>
              <p class="card-desc">
                รวมหลักสูตร Onboarding, Technical Skills (Angular 22, NestJS, AI, DevOps), และข้อสอบประเมินผล พร้อมระบบรับใบประกาศนียบัตร PDF
              </p>
              <div class="feature-bullets">
                <span>✓ วิดีโอบทเรียน + Classroom Player</span>
                <span>✓ วัดผลคะแนน & ตัดเกรดอัตโนมัติ 80%</span>
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
                Wiki คลังปัญญาแยกตามแผนก (Software Eng, QA, HR, Solutions, DevOps) ค้นหาไวทันใจ มีเจ้าของบทความและประวัติการแก้ไข
              </p>
              <div class="feature-bullets">
                <span>✓ แยกแผนก 5 Spaces ชัดเจน</span>
                <span>✓ ค้นหาคำสำคัญความเร็วสูง</span>
                <span>✓ Markdown & Code Snippet Viewer</span>
              </div>
            </div>
            <div class="card-footer">
              <a routerLink="/km" class="module-btn btn-km">
                เปิดคลังความรู้ KM →
              </a>
            </div>
          </div>

          <!-- Card 3: My Learning & Certificates -->
          <div class="module-card card-learning">
            <div class="card-icon-wrapper learning-icon">
              🏆
            </div>
            <div class="card-body">
              <div class="module-tag tag-learning">MY LEARNING</div>
              <h3 class="card-title">การเรียนของฉัน (My Learning & Certs)</h3>
              <p class="card-desc">
                แดชบอร์ดติดตามคอร์สที่กำลังเรียน ตรวจสอบคะแนนสอบประเมินย้อนหลัง และออกใบประกาศนียบัตร Digital Certificate พิมพ์ PDF ได้ทันที
              </p>
              <div class="feature-bullets">
                <span>✓ แดชบอร์ดสรุปสถิติส่วนบุคคล</span>
                <span>✓ ดูใบประกาศนียบัตร & พิมพ์ PDF</span>
                <span>✓ ประวัติผลการสอบทุกชุดข้อสอบ</span>
              </div>
            </div>
            <div class="card-footer">
              <a routerLink="/my-learning" class="module-btn btn-learning">
                ดูการเรียนของฉัน →
              </a>
            </div>
          </div>

          <!-- Card 4: Instructor & Admin Studio -->
          <div class="module-card card-admin">
            <div class="card-icon-wrapper admin-icon">
              🛡️
            </div>
            <div class="card-body">
              <div class="module-tag tag-admin">MANAGEMENT</div>
              <h3 class="card-title">ศูนย์จัดการ & ผู้สอน (Admin & Studio)</h3>
              <p class="card-desc">
                สตูดิโอสร้างคอร์สและข้อสอบแบบ Step-by-Step พร้อมระบบรายงาน Compliance Matrix ติดตามความก้าวหน้าพนักงาน และส่งออก CSV
              </p>
              <div class="feature-bullets">
                <span>✓ Course Builder 4 ขั้นตอน</span>
                <span>✓ รายงาน Compliance แยกตามแผนก</span>
                <span>✓ สลับบทบาท Admin / Instructor / Learner</span>
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
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1720px;
      margin: 0 auto;
      padding: clamp(1.25rem, 2.5vw, 2.5rem) clamp(1rem, 2.5vw, 2rem);
      width: 100%;
      box-sizing: border-box;
    }

    /* 1. Hero Section */
    .hero-section {
      position: relative;
      border-radius: 24px;
      padding: clamp(1.75rem, 3vw, 3rem) clamp(1.25rem, 2.5vw, 2.5rem);
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.14) 0%, rgba(2, 132, 199, 0.08) 50%, rgba(124, 58, 237, 0.06) 100%);
      border: 1px solid rgba(0, 168, 135, 0.28);
      overflow: hidden;
      margin-bottom: 2.25rem;
      box-sizing: border-box;
      width: 100%;
      box-shadow: 0 10px 30px -10px rgba(0, 168, 135, 0.1);
    }

    .hero-glow-bg {
      position: absolute;
      top: -80px;
      right: -80px;
      width: 350px;
      height: 350px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 168, 135, 0.25) 0%, rgba(0, 168, 135, 0) 70%);
      filter: blur(40px);
      pointer-events: none;
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
    }

    .hero-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
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
    }

    .current-date-badge {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 600;
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
      0% { box-shadow: 0 0 0 0 rgba(0, 168, 135, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(0, 168, 135, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 168, 135, 0); }
    }

    .hero-main-flex {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.75rem;
    }

    .hero-text-col {
      flex: 1;
      min-width: 280px;
    }

    .hero-title {
      font-size: clamp(1.75rem, 3vw, 2.5rem);
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      letter-spacing: -0.8px;
      margin: 0 0 0.6rem 0;
      line-height: 1.2;
    }

    .highlight {
      background: linear-gradient(120deg, #00a887, #0284c7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1rem;
      color: var(--sic-color-text-muted, #475569);
      max-width: 680px;
      margin: 0;
      line-height: 1.6;
    }

    .hero-actions-col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 240px;
    }

    .hero-action-btn {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 1.15rem;
      border-radius: 14px;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .hero-action-btn .btn-icon {
      font-size: 1.25rem;
    }

    .hero-action-btn .btn-text {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }

    .hero-action-btn .btn-text strong {
      font-size: 0.9rem;
      font-weight: 700;
    }

    .hero-action-btn .btn-text small {
      font-size: 0.72rem;
      opacity: 0.85;
      font-weight: 500;
    }

    .hero-action-btn.primary,
    .hero-action-btn.primary-pulse {
      background: #00a887;
      color: #ffffff;
      border: 1px solid #009688;
    }

    .hero-action-btn.primary:hover,
    .hero-action-btn.primary-pulse:hover {
      background: #009688;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(0, 168, 135, 0.35);
    }

    .hero-action-btn.secondary {
      background: var(--sic-color-bg, #ffffff);
      color: var(--sic-color-text-active, #0f172a);
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .hero-action-btn.secondary:hover {
      background: var(--sic-color-surface, #f8fafc);
      border-color: #0284c7;
      transform: translateY(-2px);
    }

    /* User Greeting & Streak Card */
    .user-greeting-card {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 1.5rem;
      background: var(--sic-color-bg, #ffffff);
      padding: 1.25rem 1.75rem;
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }

    .user-profile-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .greeting-avatar {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      object-fit: cover;
      border: 2.5px solid #00a887;
    }

    .greeting-details {
      min-width: 170px;
    }

    .greeting-name {
      font-size: 1.05rem;
      color: var(--sic-color-text-active, #0f172a);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .greeting-role {
      font-size: 0.82rem;
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

    .role-learner { background: rgba(0, 168, 135, 0.15); color: #00a887; }
    .role-instructor { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
    .role-admin { background: rgba(139, 92, 246, 0.15); color: #7c3aed; }

    /* Streak Widget */
    .learning-streak-widget {
      padding: 0 1.25rem;
      border-left: 1px solid var(--sic-color-border, #e2e8f0);
      border-right: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .streak-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      gap: 1rem;
      font-size: 0.8rem;
    }

    .streak-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: #ea580c;
      font-weight: 700;
    }

    .fire-icon {
      font-size: 1rem;
      animation: flameWiggle 1.5s ease-in-out infinite;
    }

    @keyframes flameWiggle {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15) rotate(5deg); }
    }

    .daily-goal-text {
      color: var(--sic-color-text-muted, #64748b);
    }

    .daily-goal-text strong {
      color: #00a887;
    }

    .streak-days-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .day-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 0.72rem;
      font-weight: 700;
      position: relative;
    }

    .day-chip.done {
      background: rgba(0, 168, 135, 0.15);
      color: #00a887;
      border: 1px solid rgba(0, 168, 135, 0.35);
    }

    .day-chip.active {
      background: #00a887;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 168, 135, 0.4);
    }

    .day-chip.pending {
      background: var(--sic-color-surface, #f1f5f9);
      color: var(--sic-color-text-muted, #94a3b8);
    }

    .day-chip .check {
      font-size: 0.6rem;
      line-height: 1;
      margin-top: -2px;
    }

    .quick-stats {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.4rem 0.75rem;
      border-radius: 12px;
      background: var(--sic-color-surface, #f8fafc);
      min-width: 80px;
    }

    .stat-num {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
    }

    .stat-label {
      font-size: 0.7rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 600;
    }

    .highlight-stat {
      background: rgba(0, 168, 135, 0.12);
    }
    .highlight-stat .stat-num {
      color: #00a887;
    }

    /* 2. Mandatory Compliance Alert */
    .compliance-alert-section {
      margin-bottom: 2.25rem;
    }

    .compliance-alert-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.75rem;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.06) 100%);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 18px;
    }

    .compliance-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(239, 68, 68, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .compliance-info {
      flex: 1;
    }

    .compliance-header-tag {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 0.35rem;
    }

    .badge-mandatory {
      font-size: 0.72rem;
      font-weight: 800;
      color: #dc2626;
      background: rgba(239, 68, 68, 0.12);
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }

    .due-date {
      font-size: 0.75rem;
      color: #b45309;
      font-weight: 600;
    }

    .compliance-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.25rem 0;
    }

    .compliance-desc {
      font-size: 0.84rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
      line-height: 1.45;
    }

    .compliance-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      background: #dc2626;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 700;
      border-radius: 12px;
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .compliance-btn:hover {
      background: #b91c1c;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
    }

    /* Common Section Styles */
    .dashboard-section {
      margin-bottom: 2.75rem;
    }

    .section-title-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .section-heading {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 0.25rem 0;
    }

    .heading-icon {
      font-size: 1.3rem;
    }

    .section-subtext {
      font-size: 0.86rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
    }

    .view-all-link {
      font-size: 0.85rem;
      font-weight: 700;
      color: #00a887;
      text-decoration: none;
      transition: all 0.2s;
    }

    .view-all-link:hover {
      color: #007965;
      text-decoration: underline;
    }

    /* 3. In-Progress Grid */
    .in-progress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 1.25rem;
    }

    .resume-card {
      display: flex;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 4px 15px -2px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
    }

    .resume-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.08);
      border-color: #00a887;
    }

    .resume-cover-wrap {
      position: relative;
      width: 140px;
      flex-shrink: 0;
    }

    .resume-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .resume-level-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      font-size: 0.65rem;
      font-weight: 700;
      background: rgba(15, 23, 42, 0.8);
      color: #ffffff;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }

    .resume-content {
      flex: 1;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .resume-category {
      font-size: 0.72rem;
      font-weight: 700;
      color: #00a887;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .resume-title {
      font-size: 0.98rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      line-height: 1.35;
    }

    .resume-title a {
      color: var(--sic-color-text-active, #0f172a);
      text-decoration: none;
    }

    .resume-title a:hover {
      color: #00a887;
    }

    .resume-meta {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
      margin-bottom: 0.75rem;
    }

    .resume-progress-wrap {
      margin-bottom: 0.85rem;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--sic-color-text-muted, #64748b);
      margin-bottom: 0.3rem;
    }

    .progress-info strong {
      color: #00a887;
    }

    .progress-track {
      width: 100%;
      height: 6px;
      background: var(--sic-color-surface, #f1f5f9);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #00a887, #10b981);
      border-radius: 999px;
      transition: width 0.4s ease;
    }

    .resume-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-resume-primary {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.45rem 0.85rem;
      background: #00a887;
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 700;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-resume-primary:hover {
      background: #009688;
    }

    .btn-resume-outline {
      padding: 0.45rem 0.75rem;
      background: transparent;
      border: 1px solid var(--sic-color-border, #cbd5e1);
      color: var(--sic-color-text, #475569);
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-resume-outline:hover {
      background: var(--sic-color-surface, #f8fafc);
      border-color: #00a887;
      color: #00a887;
    }

    /* 4. Recommended Grid */
    .recommended-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .course-mini-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .course-mini-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 168, 135, 0.4);
    }

    .mini-card-cover-wrap {
      position: relative;
      aspect-ratio: 16 / 9;
      width: 100%;
      overflow: hidden;
    }

    .mini-card-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .course-mini-card:hover .mini-card-cover {
      transform: scale(1.04);
    }

    .category-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.85);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }

    .mandatory-pill {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #dc2626;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .mini-card-body {
      padding: 1.15rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .card-meta-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.72rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .rating-badge {
      color: #d97706;
    }

    .xp-badge {
      color: #00a887;
      margin-left: auto;
      font-weight: 700;
    }

    .mini-card-title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 0.4rem 0;
      line-height: 1.35;
    }

    .mini-card-title a {
      color: var(--sic-color-text-active, #0f172a);
      text-decoration: none;
    }

    .mini-card-title a:hover {
      color: #00a887;
    }

    .mini-card-desc {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.45;
      margin: 0 0 1rem 0;
      flex-grow: 1;
    }

    .mini-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid var(--sic-color-border, #f1f5f9);
    }

    .instructor-info {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.75rem;
      color: var(--sic-color-text, #334155);
      font-weight: 600;
    }

    .inst-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }

    .btn-view-course {
      font-size: 0.8rem;
      font-weight: 700;
      color: #00a887;
      text-decoration: none;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-view-course:hover {
      background: rgba(0, 168, 135, 0.1);
    }

    /* 5. KM Articles Grid */
    .km-articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .km-article-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .km-article-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      border-color: #0284c7;
    }

    .km-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.6rem;
    }

    .km-space-pill {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }

    .space-dev { background: rgba(0, 168, 135, 0.12); color: #00a887; }
    .space-qa { background: rgba(2, 132, 199, 0.12); color: #0284c7; }
    .space-hr { background: rgba(236, 72, 153, 0.12); color: #db2777; }
    .space-solutions { background: rgba(245, 158, 11, 0.12); color: #d97706; }
    .space-devops { background: rgba(139, 92, 246, 0.12); color: #7c3aed; }

    .km-read-time {
      font-size: 0.72rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .km-article-title {
      font-size: 1.02rem;
      font-weight: 700;
      margin: 0 0 0.4rem 0;
      line-height: 1.35;
    }

    .km-article-title a {
      color: var(--sic-color-text-active, #0f172a);
      text-decoration: none;
    }

    .km-article-title a:hover {
      color: #0284c7;
    }

    .km-article-summary {
      font-size: 0.82rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.45;
      margin: 0 0 0.85rem 0;
      flex-grow: 1;
    }

    .km-tags-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .km-tag {
      font-size: 0.68rem;
      color: var(--sic-color-text-muted, #64748b);
      background: var(--sic-color-surface, #f1f5f9);
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
    }

    .km-card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid var(--sic-color-border, #f1f5f9);
    }

    .km-author {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .km-author-img {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    .km-author-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .km-author-text strong {
      font-size: 0.78rem;
      color: var(--sic-color-text-active, #0f172a);
    }

    .km-author-text small {
      font-size: 0.68rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .km-metrics {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    /* 6. Community 2-Col Grid */
    .community-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 992px) {
      .community-grid {
        grid-template-columns: 1fr;
      }
    }

    .community-col {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      padding: 1.35rem 1.5rem;
      box-shadow: 0 4px 15px -2px rgba(0, 0, 0, 0.04);
    }

    .col-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.15rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--sic-color-border, #f1f5f9);
    }

    .col-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin: 0;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: #00a887;
      font-weight: 600;
    }

    .green-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 2s infinite;
    }

    .month-tag {
      font-size: 0.72rem;
      font-weight: 700;
      background: rgba(245, 158, 11, 0.15);
      color: #b45309;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }

    .activity-feed-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.6rem 0.75rem;
      border-radius: 12px;
      background: var(--sic-color-surface, #f8fafc);
      transition: background 0.2s;
    }

    .activity-item:hover {
      background: rgba(0, 168, 135, 0.05);
    }

    .activity-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .activity-details {
      flex: 1;
    }

    .activity-text {
      font-size: 0.82rem;
      color: var(--sic-color-text, #334155);
      line-height: 1.35;
      margin-bottom: 0.2rem;
    }

    .activity-link {
      color: #00a887;
      font-weight: 600;
      text-decoration: none;
    }

    .activity-link:hover {
      text-decoration: underline;
    }

    .activity-time-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.7rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .activity-xp {
      font-weight: 700;
      color: #00a887;
    }

    .activity-badge-icon {
      font-size: 1.1rem;
    }

    /* Leaderboard */
    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .leaderboard-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.6rem 0.85rem;
      border-radius: 12px;
      background: var(--sic-color-surface, #f8fafc);
      transition: all 0.2s;
    }

    .leaderboard-row:hover {
      transform: translateX(4px);
      background: rgba(0, 168, 135, 0.06);
    }

    .leaderboard-row.current-user-row {
      background: rgba(0, 168, 135, 0.12);
      border: 1px solid rgba(0, 168, 135, 0.3);
    }

    .rank-badge {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 800;
      border-radius: 8px;
      color: var(--sic-color-text-muted, #64748b);
    }

    .lb-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
    }

    .lb-info {
      flex: 1;
    }

    .lb-name-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.84rem;
      color: var(--sic-color-text-active, #0f172a);
    }

    .you-pill {
      font-size: 0.62rem;
      font-weight: 800;
      background: #00a887;
      color: #ffffff;
      padding: 0.05rem 0.35rem;
      border-radius: 4px;
    }

    .lb-dept {
      font-size: 0.7rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .lb-xp-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1.1;
    }

    .lb-xp-num {
      font-size: 0.95rem;
      font-weight: 800;
      color: #00a887;
    }

    .lb-xp-label {
      font-size: 0.65rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 600;
    }

    /* 7. Modules Section */
    .module-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
      width: 100%;
      box-sizing: border-box;
    }

    .module-card {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 20px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: clamp(1.25rem, 2vw, 1.6rem);
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
      margin-bottom: 1.15rem;
    }

    .lms-icon { background: rgba(0, 168, 135, 0.15); }
    .km-icon { background: rgba(2, 132, 199, 0.15); }
    .learning-icon { background: rgba(245, 158, 11, 0.15); }
    .admin-icon { background: rgba(139, 92, 246, 0.15); }

    .module-tag {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .tag-lms { background: rgba(0, 168, 135, 0.12); color: #00a887; }
    .tag-km { background: rgba(2, 132, 199, 0.12); color: #0284c7; }
    .tag-learning { background: rgba(245, 158, 11, 0.12); color: #d97706; }
    .tag-admin { background: rgba(139, 92, 246, 0.12); color: #7c3aed; }

    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.5rem 0;
    }

    .card-desc {
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.5;
      margin-bottom: 1.15rem;
      flex-grow: 1;
    }

    .feature-bullets {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.78rem;
      color: var(--sic-color-text, #334155);
      margin-bottom: 1.25rem;
    }

    .module-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.7rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .btn-lms { background: #00a887; color: #ffffff; }
    .btn-lms:hover { background: #009688; box-shadow: 0 4px 12px rgba(0, 168, 135, 0.35); }

    .btn-km { background: #0284c7; color: #ffffff; }
    .btn-km:hover { background: #0369a1; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35); }

    .btn-learning { background: #d97706; color: #ffffff; }
    .btn-learning:hover { background: #b45309; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35); }

    .btn-admin { background: #7c3aed; color: #ffffff; }
    .btn-admin:hover { background: #6d28d9; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35); }

    /* Responsive adjustments */
    @media (max-width: 1100px) {
      .user-greeting-card {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
      .learning-streak-widget {
        border-left: none;
        border-right: none;
        border-top: 1px solid var(--sic-color-border, #e2e8f0);
        border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
        padding: 1rem 0;
      }
      .quick-stats {
        justify-content: space-around;
      }
    }

    @media (max-width: 640px) {
      .hero-actions-col {
        width: 100%;
      }
      .resume-card {
        flex-direction: column;
      }
      .resume-cover-wrap {
        width: 100%;
        height: 140px;
      }
      .compliance-alert-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .compliance-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `],
})
export class DashboardComponent {
  private readonly authState = inject(AuthStateService);
  private readonly coursesService = inject(CoursesService);
  private readonly kmService = inject(KmService);

  readonly currentRole = this.authState.currentRole;
  readonly user = this.authState.currentUser;

  readonly currentDateFormatted = new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Courses data
  readonly allCourses = this.coursesService.courses;
  readonly totalCourses = computed(() => this.allCourses().length);

  // In-progress courses for quick resume
  readonly inProgressCourses = computed(() =>
    this.allCourses().filter((c) => c.enrolledStatus === 'in_progress')
  );

  // Mandatory course for compliance notice
  readonly mandatoryCourse = computed(() =>
    this.allCourses().find((c) => c.isMandatory) || null
  );

  // Recommended courses for user (e.g. top rated or highlighted)
  readonly recommendedCourses = computed(() =>
    this.allCourses()
      .filter((c) => c.category === 'Software Engineering' || c.category === 'AI & Data' || c.category === 'DevOps & Cloud')
      .slice(0, 4)
  );

  // Featured KM articles
  readonly featuredArticles = computed(() =>
    this.kmService.articles().slice(0, 3)
  );

  // Helper for Space name in KM
  getSpaceName(spaceId: string): string {
    const map: Record<string, string> = {
      dev: '💻 Software Eng',
      qa: '🧪 QA & Testing',
      hr: '🤝 People & HR',
      solutions: '📈 Solutions',
      devops: '🛠️ DevOps & Cloud',
    };
    return map[spaceId] || spaceId;
  }

  // Live activity feed simulation
  readonly liveActivities = signal<ActivityItem[]>([
    {
      id: 'act-1',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      userName: 'กานดา วงศ์สุวรรณ',
      action: 'สอบผ่านแบบทดสอบ',
      targetTitle: 'Signals Foundation & Reactivity',
      targetRoute: '/courses/angular-22-signals-mastery',
      timeAgo: '5 นาทีที่แล้ว',
      icon: '🎯',
      xpEarned: 250,
    },
    {
      id: 'act-2',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      userName: 'ธนพล กิตติพงศ์',
      action: 'สำเร็จหลักสูตรและได้รับใบประกาศนียบัตร',
      targetTitle: 'Angular 22 Zoneless Architecture',
      targetRoute: '/courses/angular-22-signals-mastery',
      timeAgo: '20 นาทีที่แล้ว',
      icon: '🏆',
      xpEarned: 500,
    },
    {
      id: 'act-3',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      userName: 'ศิริพร บุญรักษา',
      action: 'เผยแพร่องค์ความรู้ใหม่ใน KM Space',
      targetTitle: 'Solution Proposal Template 2026',
      targetRoute: '/km/art-004',
      timeAgo: '1 ชั่วโมงที่แล้ว',
      icon: '💡',
    },
    {
      id: 'act-4',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      userName: 'อิงครัต ศรีทอง',
      action: 'อัปเดตบทเรียนใหม่ในสตูดิโอ',
      targetTitle: 'NestJS Microservices v2',
      targetRoute: '/courses/advanced-nestjs-microservices',
      timeAgo: '3 ชั่วโมงที่แล้ว',
      icon: '✍️',
    },
  ]);

  // Leaderboard data
  readonly leaderboardUsers = signal<LeaderboardUser[]>([
    {
      rank: 1,
      name: 'Aingkharat Srithong',
      thaiName: 'อิงครัต ศรีทอง',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Senior Software Engineer',
      department: 'Software Eng',
      xp: 2450,
      completedCourses: 4,
      badge: 'Pro Learner',
    },
    {
      rank: 2,
      name: 'Kanda Wongsuwan',
      thaiName: 'กานดา วงศ์สุวรรณ',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Fullstack Developer',
      department: 'Software Eng',
      xp: 2180,
      completedCourses: 3,
      badge: 'Advanced',
    },
    {
      rank: 3,
      name: 'Thanapol Kittipong',
      thaiName: 'ธนพล กิตติพงศ์',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'DevOps Lead',
      department: 'Infra & DevOps',
      xp: 1950,
      completedCourses: 3,
      badge: 'Cloud Master',
    },
    {
      rank: 4,
      name: 'Nattawut Sittichai',
      thaiName: 'ณัฐวุฒิ สิทธิชัย',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'QA Automation Engineer',
      department: 'QA & Testing',
      xp: 1720,
      completedCourses: 2,
      badge: 'Test Guru',
    },
    {
      rank: 5,
      name: 'Siriporn Boonraksa',
      thaiName: 'ศิริพร บุญรักษา',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'Solutions Architect',
      department: 'Solutions Dev',
      xp: 1540,
      completedCourses: 2,
      badge: 'Solution Pro',
    },
  ]);
}

import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../core/services/courses.service';
import { Course, CourseLesson, CourseModule } from '../../core/models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="course-detail-page" *ngIf="course(); else notFound">
      <!-- Floating Toast Notification -->
      <div *ngIf="toastMessage()" class="toast-floating">
        <div class="toast-content">
          <span class="toast-icon">✨</span>
          <div class="toast-text">
            <strong>แจ้งเตือนจากระบบ</strong>
            <span>{{ toastMessage() }}</span>
          </div>
        </div>
        <button type="button" class="toast-close" (click)="toastMessage.set(null)">✕</button>
      </div>

      <!-- 1. Breadcrumbs Bar -->
      <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <div class="breadcrumb-container">
          <a routerLink="/" class="breadcrumb-link">🏠 หน้าแรก</a>
          <span class="breadcrumb-sep">/</span>
          <a routerLink="/courses" class="breadcrumb-link">คลังหลักสูตรทั้งหมด</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ course()?.title }}</span>
        </div>
      </nav>

      <!-- 2. Course Hero Banner -->
      <header class="detail-hero">
        <img [src]="course()!.thumbnail" [alt]="course()!.title" class="hero-bg-img" />
        <div class="hero-backdrop"></div>
        <div class="hero-inner">
          <div class="hero-main-content">
            <!-- Badges Row -->
            <div class="hero-badges">
              <span class="badge-category" [ngClass]="getCategoryClass(course()!.category)">
                {{ course()!.category }}
              </span>
              <span class="badge-level" [ngClass]="'level-' + course()!.level.toLowerCase()">
                {{ course()!.level }}
              </span>
              <span *ngIf="course()!.isMandatory" class="badge-mandatory">
                ★ คอร์สบังคับ
              </span>
              <span class="badge-xp">⚡ {{ course()!.xpAward }} XP</span>
              <span *ngIf="course()!.certificateAvailable" class="badge-cert">
                🏆 มีใบ Certificate
              </span>
            </div>

            <!-- Title & Subtitle -->
            <h1 class="hero-title">{{ course()!.title }}</h1>
            <p *ngIf="course()!.thaiTitle" class="hero-thai-title">
              {{ course()!.thaiTitle }}
            </p>

            <p class="hero-desc">{{ course()!.shortDescription }}</p>

            <!-- Key Metadata Metrics -->
            <div class="hero-meta-row">
              <div class="meta-pill rating-pill">
                <span class="star-icon">★</span>
                <strong>{{ course()!.rating }}</strong>
                <span class="meta-sub">({{ course()!.ratingCount }} รีวิว)</span>
              </div>

              <div class="meta-pill">
                <span class="meta-icon">👥</span>
                <span>{{ course()!.totalEnrolled }} ผู้เรียนในองค์กร</span>
              </div>

              <div class="meta-pill">
                <span class="meta-icon">⏱️</span>
                <span>{{ course()!.duration }}</span>
              </div>

              <div class="meta-pill">
                <span class="meta-icon">📚</span>
                <span>{{ course()!.totalLessons }} บทเรียน</span>
              </div>

              <div class="meta-pill">
                <span class="meta-icon">🌐</span>
                <span>{{ course()!.language || 'ภาษาไทย' }}</span>
              </div>

              <div class="meta-pill">
                <span class="meta-icon">🔄</span>
                <span>อัปเดต: {{ course()!.lastUpdated || 'สิงหาคม 2026' }}</span>
              </div>
            </div>

            <!-- Instructor Quick Bar -->
            <div class="hero-instructor-bar">
              <img
                [src]="course()!.instructor.avatar"
                [alt]="course()!.instructor.name"
                class="hero-inst-avatar"
              />
              <div class="hero-inst-details">
                <span class="inst-label">ผู้สอนหลักสูตร</span>
                <span class="inst-name">{{ course()!.instructor.thaiName }}</span>
                <span class="inst-role">{{ course()!.instructor.title }} • {{ course()!.instructor.department }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 3. Main Two-Column Layout -->
      <div class="detail-layout">
        <!-- LEFT COLUMN: Main Course Information -->
        <main class="detail-main-col">
          <!-- 3.1 What You Will Learn Card -->
          <section class="section-card what-learn-card" *ngIf="course()!.whatYouWillLearn?.length">
            <div class="section-header">
              <span class="section-icon">🎯</span>
              <h2 class="section-title">สิ่งที่คุณจะได้เรียนรู้ในหลักสูตรนี้</h2>
            </div>
            <div class="learn-grid">
              <div *ngFor="let item of course()!.whatYouWillLearn" class="learn-item">
                <span class="check-icon">✓</span>
                <span class="learn-text">{{ item }}</span>
              </div>
            </div>
          </section>

          <!-- 3.2 Content Navigation Tabs -->
          <div class="content-nav-tabs">
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'curriculum'"
              (click)="activeTab.set('curriculum')"
            >
              📚 โครงสร้างบทเรียน ({{ course()!.totalLessons }})
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'overview'"
              (click)="activeTab.set('overview')"
            >
              📄 รายละเอียด & ข้อกำหนด
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'instructor'"
              (click)="activeTab.set('instructor')"
            >
              👨‍🏫 ข้อมูลผู้สอน
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'reviews'"
              (click)="activeTab.set('reviews')"
            >
              💬 รีวิว & ข้อเสนอแนะ ({{ course()!.ratingCount }})
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'faq'"
              (click)="activeTab.set('faq')"
            >
              ❓ คำถามที่พบบ่อย (FAQ)
            </button>
          </div>

          <!-- 3.3 TAB 1: Curriculum & Outline -->
          <section *ngIf="activeTab() === 'curriculum'" class="section-card curriculum-section">
            <div class="curriculum-header">
              <div>
                <h2 class="section-title">เนื้อหาและบทเรียนทั้งหมด</h2>
                <p class="curriculum-sub">
                  {{ course()!.modules.length }} โมดูล • {{ course()!.totalLessons }} บทเรียน • ความยาวรวม {{ course()!.duration }}
                </p>
              </div>
              <button type="button" class="btn-toggle-all" (click)="toggleAllModules()">
                {{ allExpanded() ? '▲ ยุบทั้งหมด' : '▼ ขยายทั้งหมด' }}
              </button>
            </div>

            <!-- Modules Accordion List -->
            <div class="modules-accordion">
              <div
                *ngFor="let mod of course()!.modules; let mIdx = index"
                class="module-card"
                [class.is-open]="isModuleExpanded(mod.id)"
              >
                <!-- Module Header Trigger -->
                <button
                  type="button"
                  class="module-header-btn"
                  (click)="toggleModule(mod.id)"
                >
                  <div class="module-title-group">
                    <span class="module-caret">{{ isModuleExpanded(mod.id) ? '▾' : '▸' }}</span>
                    <strong class="module-title">{{ mod.title }}</strong>
                  </div>
                  <div class="module-meta">
                    <span class="module-count">{{ mod.lessons.length }} บทเรียน</span>
                  </div>
                </button>

                <!-- Module Body (Lessons List) -->
                <div *ngIf="isModuleExpanded(mod.id)" class="module-lessons-list">
                  <p *ngIf="mod.description" class="module-desc">{{ mod.description }}</p>

                  <div
                    *ngFor="let lesson of mod.lessons; let lIdx = index"
                    class="lesson-row"
                    [class.lesson-done]="lesson.isCompleted"
                  >
                    <!-- Lesson Status & Icon -->
                    <div class="lesson-left">
                      <!-- Completion Checkbox (Clickable if enrolled) -->
                      <button
                        type="button"
                        class="lesson-checkbox"
                        [class.checked]="lesson.isCompleted"
                        (click)="onToggleLesson(lesson.id, $event)"
                        [title]="course()!.enrolledStatus !== 'not_enrolled' ? 'คลิกเพื่อเปลี่ยนสถานะเรียนจบ' : 'ลงทะเบียนเพื่อบันทึกการเรียน'"
                      >
                        {{ lesson.isCompleted ? '✓' : '' }}
                      </button>

                      <span class="lesson-type-icon" [title]="getLessonTypeLabel(lesson.type)">
                        {{ getLessonTypeIcon(lesson.type) }}
                      </span>

                      <div class="lesson-info">
                        <span class="lesson-title">{{ lesson.title }}</span>
                        <span class="lesson-type-badge">{{ getLessonTypeLabel(lesson.type) }}</span>
                      </div>
                    </div>

                    <!-- Lesson Right Metadata & Actions -->
                    <div class="lesson-right">
                      <span *ngIf="lesson.isPreviewable" class="badge-preview">
                        👁️ ดูตัวอย่างฟรี
                      </span>
                      <span class="lesson-duration">{{ lesson.duration }}</span>
                      
                      <button
                        type="button"
                        class="btn-lesson-action"
                        (click)="onStartLesson(lesson, $event)"
                      >
                        {{ lesson.isCompleted ? 'ทบทวน' : 'เริ่มเรียน' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3.4 TAB 2: Overview & Requirements -->
          <section *ngIf="activeTab() === 'overview'" class="section-card overview-section">
            <h2 class="section-title">รายละเอียดหลักสูตรเชิงลึก</h2>
            <div class="rich-text-content">
              <p>{{ course()!.description }}</p>
            </div>

            <div class="overview-grid">
              <!-- Requirements Box -->
              <div class="info-box" *ngIf="course()!.requirements?.length">
                <h3 class="info-box-title">
                  <span class="box-icon">📋</span> ความรู้พื้นฐานที่ต้องมี (Prerequisites)
                </h3>
                <ul class="info-list">
                  <li *ngFor="let req of course()!.requirements">{{ req }}</li>
                </ul>
              </div>

              <!-- Target Audience Box -->
              <div class="info-box" *ngIf="course()!.targetAudience?.length">
                <h3 class="info-box-title">
                  <span class="box-icon">👥</span> เหมาะสำหรับใคร (Target Audience)
                </h3>
                <ul class="info-list">
                  <li *ngFor="let aud of course()!.targetAudience">{{ aud }}</li>
                </ul>
              </div>
            </div>

            <!-- Tags List -->
            <div class="tags-section">
              <h3 class="tags-heading">ทักษะและเทคโนโลยีที่ครอบคลุม:</h3>
              <div class="tags-cloud">
                <span *ngFor="let tag of course()!.tags" class="tag-pill">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </section>

          <!-- 3.5 TAB 3: Instructor Profile -->
          <section *ngIf="activeTab() === 'instructor'" class="section-card instructor-section">
            <h2 class="section-title">ข้อมูลผู้สอน (Instructor Profile)</h2>
            <div class="instructor-card-full">
              <div class="inst-card-top">
                <img
                  [src]="course()!.instructor.avatar"
                  [alt]="course()!.instructor.name"
                  class="inst-avatar-large"
                />
                <div class="inst-meta-full">
                  <h3 class="inst-fullname">{{ course()!.instructor.thaiName }}</h3>
                  <span class="inst-engname">({{ course()!.instructor.name }})</span>
                  <p class="inst-jobtitle">{{ course()!.instructor.title }}</p>
                  <p class="inst-dept">สังกัด: {{ course()!.instructor.department }}</p>

                  <div class="inst-stats-row">
                    <div class="inst-stat">
                      <strong>{{ course()!.instructor.totalCourses || 4 }}</strong>
                      <span>หลักสูตร</span>
                    </div>
                    <div class="inst-stat">
                      <strong>{{ course()!.instructor.totalStudents || 350 }}</strong>
                      <span>ผู้เรียนในสังกัด</span>
                    </div>
                    <div class="inst-stat">
                      <strong>{{ course()!.instructor.rating || 4.9 }} ★</strong>
                      <span>คะแนนเฉลี่ย</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="inst-bio" *ngIf="course()!.instructor.bio">
                <h4>ประวัติและประสบการณ์</h4>
                <p>{{ course()!.instructor.bio }}</p>
              </div>
            </div>
          </section>

          <!-- 3.6 TAB 4: Peer Reviews & Ratings -->
          <section *ngIf="activeTab() === 'reviews'" class="section-card reviews-section">
            <h2 class="section-title">รีวิวและข้อเสนอแนะจากเพื่อนร่วมงาน</h2>
            
            <div class="reviews-summary-box">
              <div class="rating-big-score">
                <span class="score-number">{{ course()!.rating }}</span>
                <div class="score-stars">★★★★★</div>
                <span class="score-count">จาก {{ course()!.ratingCount }} รีวิว</span>
              </div>

              <div class="rating-bars">
                <div class="rating-bar-row">
                  <span>5 ดาว</span>
                  <div class="bar-track"><div class="bar-fill" style="width: 88%"></div></div>
                  <span>88%</span>
                </div>
                <div class="rating-bar-row">
                  <span>4 ดาว</span>
                  <div class="bar-track"><div class="bar-fill" style="width: 10%"></div></div>
                  <span>10%</span>
                </div>
                <div class="rating-bar-row">
                  <span>3 ดาว</span>
                  <div class="bar-track"><div class="bar-fill" style="width: 2%"></div></div>
                  <span>2%</span>
                </div>
                <div class="rating-bar-row">
                  <span>2 ดาว</span>
                  <div class="bar-track"><div class="bar-fill" style="width: 0%"></div></div>
                  <span>0%</span>
                </div>
                <div class="rating-bar-row">
                  <span>1 ดาว</span>
                  <div class="bar-track"><div class="bar-fill" style="width: 0%"></div></div>
                  <span>0%</span>
                </div>
              </div>
            </div>

            <!-- Review Items -->
            <div class="reviews-list" *ngIf="course()!.reviews?.length; else noReviews">
              <div *ngFor="let rev of course()!.reviews" class="review-item">
                <div class="review-header">
                  <img [src]="rev.userAvatar" [alt]="rev.userName" class="reviewer-avatar" />
                  <div class="reviewer-info">
                    <div class="reviewer-top">
                      <strong class="reviewer-name">{{ rev.userName }}</strong>
                      <span class="review-date">{{ rev.date }}</span>
                    </div>
                    <span class="reviewer-role">{{ rev.userRole }} • {{ rev.department }}</span>
                  </div>
                </div>
                <div class="review-stars-row">
                  <span class="review-stars">★ {{ rev.rating }}.0</span>
                </div>
                <p class="review-comment">{{ rev.comment }}</p>
              </div>
            </div>
            <ng-template #noReviews>
              <p class="no-reviews-text">ยังไม่มีความคิดเห็นสำหรับหลักสูตรนี้</p>
            </ng-template>
          </section>

          <!-- 3.7 TAB 5: FAQ -->
          <section *ngIf="activeTab() === 'faq'" class="section-card faq-section">
            <h2 class="section-title">คำถามที่พบบ่อย (Frequently Asked Questions)</h2>
            <div class="faq-list" *ngIf="course()!.faqs?.length; else defaultFaqs">
              <div *ngFor="let faq of course()!.faqs" class="faq-item">
                <h3 class="faq-q">❓ {{ faq.question }}</h3>
                <p class="faq-a">{{ faq.answer }}</p>
              </div>
            </div>
            <ng-template #defaultFaqs>
              <div class="faq-item">
                <h3 class="faq-q">❓ หลักสูตรนี้เรียนได้ตลอดเวลาหรือไม่?</h3>
                <p class="faq-a">สามารถเรียนได้ตลอด 24 ชั่วโมง ผ่านระบบ SICR E-LEARNING บนเว็บเบราว์เซอร์ทุกอุปกรณ์</p>
              </div>
              <div class="faq-item">
                <h3 class="faq-q">❓ เมื่อเรียนจบจะได้รับใบรับรอง Certificate ทันทีหรือไม่?</h3>
                <p class="faq-a">เมื่อเรียนครบ 100% และผ่านแบบทดสอบประเมินผลเกณฑ์ 80% ระบบจะสร้างใบประกาศนียบัตรดิจิทัลให้อัตโนมัติ</p>
              </div>
            </ng-template>
          </section>
        </main>

        <!-- RIGHT COLUMN: Sticky Enrollment & Action Sidebar -->
        <aside class="detail-sidebar-col">
          <div class="sticky-sidebar-card">
            <!-- Course Video Thumbnail / Preview -->
            <div class="preview-media-wrapper" (click)="onPreviewClick()">
              <img [src]="course()!.thumbnail" [alt]="course()!.title" class="preview-img" />
              <div class="preview-overlay">
                <div class="play-btn-circle">
                  <span class="play-icon">▶</span>
                </div>
                <span class="preview-text">ดูตัวอย่างหลักสูตร</span>
              </div>
            </div>

            <!-- Enrollment & Action Body -->
            <div class="sidebar-body">
              <!-- Case 1: In Progress -->
              <div *ngIf="course()!.enrolledStatus === 'in_progress'" class="status-box in-progress-box">
                <div class="status-header">
                  <span class="status-tag tag-progress">⚡ กำลังเรียนอยู่</span>
                  <span class="progress-pct-num">{{ course()!.userProgressPercent }}%</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-val" [style.width.%]="course()!.userProgressPercent"></div>
                </div>
                <p class="last-lesson-hint" *ngIf="course()!.lastAccessedLessonTitle">
                  ล่าสุด: {{ course()!.lastAccessedLessonTitle }}
                </p>
                <button type="button" class="btn-primary-action btn-resume-main" (click)="onResumeLearning()">
                  <span>▶ เข้าสู่ห้องเรียน (Classroom)</span>
                </button>
              </div>

              <!-- Case 2: Completed -->
              <div *ngIf="course()!.enrolledStatus === 'completed'" class="status-box completed-box">
                <div class="status-header">
                  <span class="status-tag tag-done">✓ เรียนจบสมบูรณ์แล้ว</span>
                  <span class="progress-pct-num">100%</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-val bar-done" style="width: 100%"></div>
                </div>
                <button type="button" class="btn-primary-action btn-cert-main" (click)="onViewCertificate()">
                  <span>🏆 ดูใบประกาศนียบัตร (Certificate)</span>
                </button>
                <button type="button" class="btn-secondary-action" (click)="onResumeLearning()">
                  <span>🔄 ทบทวนเนื้อหาบทเรียน</span>
                </button>
              </div>

              <!-- Case 3: Not Enrolled -->
              <div *ngIf="course()!.enrolledStatus === 'not_enrolled'" class="status-box not-enrolled-box">
                <div class="price-free-row">
                  <span class="free-badge">สิทธิ์พนักงานเรียนฟรี</span>
                  <span class="xp-reward">+{{ course()!.xpAward }} XP</span>
                </div>
                <button type="button" class="btn-primary-action btn-enroll-main" (click)="onEnrollCourse()">
                  <span>🚀 ลงทะเบียนเรียนทันที (Enroll)</span>
                </button>
              </div>

              <!-- Course Inclusions Checklist -->
              <div class="course-includes">
                <h4 class="includes-title">หลักสูตรนี้ประกอบด้วย:</h4>
                <ul class="includes-list">
                  <li>
                    <span class="inc-icon">⏱️</span>
                    <span>วิดีโอบทเรียนความยาว {{ course()!.duration }}</span>
                  </li>
                  <li>
                    <span class="inc-icon">📚</span>
                    <span>{{ course()!.totalLessons }} บทเรียนพร้อมแบบฝึกหัด</span>
                  </li>
                  <li>
                    <span class="inc-icon">📥</span>
                    <span>เอกสารประกอบและ Source Code</span>
                  </li>
                  <li>
                    <span class="inc-icon">📝</span>
                    <span>แบบทดสอบประเมินผลความเข้าใจ</span>
                  </li>
                  <li>
                    <span class="inc-icon">🏆</span>
                    <span>ใบรับรอง Certificate รับรองจาก Soft Inter</span>
                  </li>
                  <li>
                    <span class="inc-icon">⚡</span>
                    <span>รับ {{ course()!.xpAward }} XP สำหรับเลื่อนระดับ</span>
                  </li>
                  <li>
                    <span class="inc-icon">📱</span>
                    <span>เรียนได้ทุกอุปกรณ์ PC, Tablet, Mobile</span>
                  </li>
                  <li>
                    <span class="inc-icon">♾️</span>
                    <span>เข้าถึงเนื้อหาได้ตลอดอายุงาน</span>
                  </li>
                </ul>
              </div>

              <!-- Share & Actions Row -->
              <div class="sidebar-secondary-actions">
                <button type="button" class="btn-share" (click)="onShareCourse()">
                  <span>🔗 คัดลอกลิงก์หลักสูตร</span>
                </button>
                <button
                  *ngIf="course()!.enrolledStatus !== 'not_enrolled'"
                  type="button"
                  class="btn-unenroll"
                  (click)="onUnenrollCourse()"
                >
                  <span>ยกเลิกการลงทะเบียน</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- 4. Course Not Found Fallback -->
    <ng-template #notFound>
      <div class="not-found-container">
        <div class="not-found-icon">🔍</div>
        <h2>ไม่พบหลักสูตรที่คุณต้องการ</h2>
        <p>หลักสูตรนี้อาจถูกย้าย หรือรหัสหลักสูตรไม่ถูกต้อง</p>
        <a routerLink="/courses" class="btn-back-catalog">
          ← กลับสู่คลังหลักสูตรทั้งหมด
        </a>
      </div>
    </ng-template>
  `,
  styles: [`
    .course-detail-page {
      max-width: 1720px;
      margin: 0 auto;
      padding: clamp(1rem, 2vw, 2.5rem) clamp(1rem, 2.5vw, 2.5rem) 4rem clamp(1rem, 2.5vw, 2.5rem);
      width: 100%;
      box-sizing: border-box;
      position: relative;
    }

    /* Floating Toast */
    .toast-floating {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      background: #0f172a;
      color: #ffffff;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      border: 1px solid rgba(0, 168, 135, 0.5);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 460px;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from { transform: translateY(-20px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .toast-content { display: flex; align-items: center; gap: 0.75rem; }
    .toast-icon { font-size: 1.5rem; }
    .toast-text { display: flex; flex-direction: column; gap: 0.2rem; }
    .toast-text strong { font-size: 0.88rem; color: #34d399; }
    .toast-text span { font-size: 0.82rem; color: #cbd5e1; line-height: 1.35; }
    .toast-close { background: transparent; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; }

    /* Breadcrumbs */
    .breadcrumb-nav {
      margin-bottom: 1.25rem;
      width: 100%;
      box-sizing: border-box;
    }

    .breadcrumb-container {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
      width: 100%;
      box-sizing: border-box;
    }

    .breadcrumb-link {
      color: var(--sic-color-text-muted, #64748b);
      text-decoration: none;
      transition: color 0.2s ease;
      white-space: nowrap;
    }

    .breadcrumb-link:hover {
      color: #00a887;
    }

    .breadcrumb-sep {
      color: #94a3b8;
    }

    .breadcrumb-current {
      color: var(--sic-color-text-active, #0f172a);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 450px;
    }

    /* Hero Section */
    .detail-hero {
      position: relative;
      border-radius: 24px;
      padding: clamp(2rem, 3.5vw, 3.5rem) clamp(1.5rem, 3vw, 3rem);
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc;
      margin-bottom: 2rem;
      overflow: hidden;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.15);
      width: 100%;
      box-sizing: border-box;
    }

    .hero-bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(6px) brightness(0.45) saturate(1.3);
      z-index: 0;
      pointer-events: none;
    }

    .hero-backdrop {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.6) 100%),
        radial-gradient(circle at top right, rgba(0, 168, 135, 0.25) 0%, transparent 60%);
      pointer-events: none;
      z-index: 1;
    }

    .hero-inner {
      position: relative;
      z-index: 2;
    }

    .hero-badges {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .badge-category {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      background: rgba(0, 168, 135, 0.85);
      color: #ffffff;
      white-space: nowrap;
    }

    .badge-category.cat-software { background: #00a887; }
    .badge-category.cat-ai { background: #7c3aed; }
    .badge-category.cat-devops { background: #0284c7; }
    .badge-category.cat-qa { background: #ea580c; }
    .badge-category.cat-hr { background: #db2777; }
    .badge-category.cat-mgmt { background: #4f46e5; }

    .badge-level {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .level-beginner { background: rgba(16, 185, 129, 0.25); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .level-intermediate { background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .level-advanced { background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

    .badge-mandatory {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      background: #ef4444;
      color: #ffffff;
      white-space: nowrap;
    }

    .badge-xp {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.15);
      color: #facc15;
      border: 1px solid rgba(250, 204, 21, 0.3);
    }

    .badge-cert {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }

    .hero-title {
      font-size: clamp(1.8rem, 3.2vw, 2.6rem);
      font-weight: 800;
      line-height: 1.25;
      margin: 0 0 0.5rem 0;
      color: #ffffff;
      letter-spacing: -0.5px;
      word-break: break-word;
    }

    .hero-thai-title {
      font-size: clamp(1rem, 1.6vw, 1.25rem);
      color: #94a3b8;
      margin: 0 0 1.25rem 0;
      line-height: 1.4;
    }

    .hero-desc {
      font-size: 1rem;
      color: #cbd5e1;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 0 1.75rem 0;
    }

    .hero-meta-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      font-size: 0.82rem;
      color: #e2e8f0;
      white-space: nowrap;
    }

    .rating-pill {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .star-icon {
      color: #fbbf24;
      font-size: 0.95rem;
    }

    .meta-sub {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .hero-instructor-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .hero-inst-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #00a887;
      flex-shrink: 0;
    }

    .hero-inst-details {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .inst-label {
      font-size: 0.72rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .inst-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
    }

    .inst-role {
      font-size: 0.8rem;
      color: #cbd5e1;
    }

    /* Layout Grid */
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: start;
      width: 100%;
      box-sizing: border-box;
    }

    /* CRITICAL: Grid children MUST have min-width: 0 to allow shrinking */
    .detail-main-col {
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
    }

    .detail-sidebar-col {
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
    }

    @media (min-width: 1440px) {
      .detail-layout {
        grid-template-columns: 1fr 420px;
        gap: 2.5rem;
      }
    }

    @media (max-width: 1080px) {
      .detail-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      /* Show sidebar above content on tablet/mobile so enrollment CTA is prominent */
      .detail-sidebar-col {
        order: -1;
      }
    }

    @media (max-width: 640px) {
      .detail-layout {
        gap: 1rem;
      }
    }

    /* Section Cards Common */
    .section-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      padding: clamp(1.25rem, 2.5vw, 2rem);
      margin-bottom: 2rem;
      box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.03);
      box-sizing: border-box;
      width: 100%;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.25rem;
    }

    .section-icon {
      font-size: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0;
      line-height: 1.3;
    }

    /* 3.1 What Learn Grid */
    .what-learn-card {
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.06) 0%, rgba(2, 132, 199, 0.04) 100%);
      border: 1.5px solid rgba(0, 168, 135, 0.25);
    }

    .learn-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 640px) {
      .learn-grid {
        grid-template-columns: 1fr;
      }
    }

    .learn-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: var(--sic-color-bg, #ffffff);
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-sizing: border-box;
    }

    .check-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #00a887;
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: bold;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    .learn-text {
      font-size: 0.88rem;
      color: var(--sic-color-text, #334155);
      line-height: 1.45;
      word-break: break-word;
    }

    /* 3.2 Content Tabs */
    .content-nav-tabs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.75rem;
      margin-bottom: 1.5rem;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
      max-width: 100%;
      width: 100%;
      box-sizing: border-box;
    }

    .tab-btn {
      padding: 0.75rem 1.25rem;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 12px;
      color: var(--sic-color-text-muted, #64748b);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      border-color: #00a887;
      color: #00a887;
    }

    .tab-btn.active {
      background: #00a887;
      color: #ffffff;
      border-color: #00a887;
      box-shadow: 0 4px 14px rgba(0, 168, 135, 0.35);
    }

    /* 3.3 Curriculum Section */
    .curriculum-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .curriculum-sub {
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0.25rem 0 0 0;
    }

    .btn-toggle-all {
      padding: 0.5rem 0.9rem;
      background: var(--sic-color-surface, #f1f5f9);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--sic-color-text, #334155);
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-toggle-all:hover {
      background: var(--sic-color-surface-hover, #e2e8f0);
      color: var(--sic-color-text-active, #0f172a);
    }

    .modules-accordion {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .module-card {
      background: var(--sic-color-surface, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s ease;
      width: 100%;
      box-sizing: border-box;
    }

    .module-card.is-open {
      border-color: rgba(0, 168, 135, 0.4);
    }

    .module-header-btn {
      width: 100%;
      padding: 1.1rem 1.25rem;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      cursor: pointer;
      text-align: left;
      box-sizing: border-box;
    }

    .module-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .module-caret {
      font-size: 1.1rem;
      color: #00a887;
      width: 16px;
      flex-shrink: 0;
    }

    .module-title {
      font-size: 0.98rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      word-break: break-word;
    }

    .module-meta {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .module-lessons-list {
      padding: 0 1.25rem 1.25rem 1.25rem;
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-bg, #ffffff);
      box-sizing: border-box;
    }

    .module-desc {
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0.75rem 0 1rem 0;
      line-height: 1.45;
    }

    .lesson-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.8rem 0;
      border-bottom: 1px dashed var(--sic-color-border, #e2e8f0);
      box-sizing: border-box;
    }

    .lesson-row:last-child {
      border-bottom: none;
    }

    .lesson-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 240px;
    }

    .lesson-checkbox {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 2px solid var(--sic-color-border, #cbd5e1);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: bold;
      color: #ffffff;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .lesson-checkbox.checked {
      background: #10b981;
      border-color: #10b981;
    }

    .lesson-type-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .lesson-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .lesson-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--sic-color-text-active, #0f172a);
      word-break: break-word;
    }

    .lesson-done .lesson-title {
      color: var(--sic-color-text-muted, #64748b);
    }

    .lesson-type-badge {
      font-size: 0.7rem;
      color: var(--sic-color-text-muted, #94a3b8);
    }

    .lesson-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .badge-preview {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
      white-space: nowrap;
    }

    .lesson-duration {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      white-space: nowrap;
    }

    .btn-lesson-action {
      padding: 0.35rem 0.75rem;
      background: var(--sic-color-surface, #f1f5f9);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--sic-color-text, #334155);
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-lesson-action:hover {
      background: #00a887;
      color: #ffffff;
      border-color: #00a887;
    }

    /* 3.4 Overview Grid */
    .rich-text-content {
      font-size: 0.95rem;
      line-height: 1.7;
      color: var(--sic-color-text, #334155);
      margin-bottom: 1.5rem;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      width: 100%;
      box-sizing: border-box;
    }

    .info-box {
      background: var(--sic-color-surface, #f8fafc);
      padding: 1.25rem;
      border-radius: 14px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-sizing: border-box;
    }

    .info-box-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.75rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-list {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.86rem;
      color: var(--sic-color-text, #334155);
      line-height: 1.6;
    }

    .tags-section {
      padding-top: 1rem;
      border-top: 1px dashed var(--sic-color-border, #e2e8f0);
    }

    .tags-heading {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0 0 0.5rem 0;
    }

    .tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag-pill {
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      background: var(--sic-color-surface, #f1f5f9);
      color: var(--sic-color-text, #334155);
      border-radius: 6px;
    }

    /* 3.5 Instructor Full Card */
    .instructor-card-full {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      box-sizing: border-box;
    }

    .inst-card-top {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .inst-avatar-large {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #00a887;
      flex-shrink: 0;
    }

    .inst-meta-full {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }

    .inst-fullname {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0;
    }

    .inst-engname {
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .inst-jobtitle {
      font-size: 0.92rem;
      font-weight: 600;
      color: #00a887;
      margin: 0;
    }

    .inst-dept {
      font-size: 0.82rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
    }

    .inst-stats-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 0.75rem;
    }

    .inst-stat {
      display: flex;
      flex-direction: column;
    }

    .inst-stat strong {
      font-size: 1.1rem;
      color: var(--sic-color-text-active, #0f172a);
    }

    .inst-stat span {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .inst-bio h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.5rem 0;
    }

    .inst-bio p {
      font-size: 0.9rem;
      color: var(--sic-color-text, #334155);
      line-height: 1.6;
      margin: 0;
    }

    /* 3.6 Reviews Section */
    .reviews-summary-box {
      display: flex;
      align-items: center;
      gap: 2.5rem;
      padding: 1.5rem;
      background: var(--sic-color-surface, #f8fafc);
      border-radius: 16px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      margin-bottom: 2rem;
      box-sizing: border-box;
      flex-wrap: wrap;
    }

    .rating-big-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      min-width: 120px;
    }

    .score-number {
      font-size: 3rem;
      font-weight: 800;
      color: #d97706;
      line-height: 1;
    }

    .score-stars {
      color: #f59e0b;
      font-size: 1.2rem;
    }

    .score-count {
      font-size: 0.78rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .rating-bars {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
      min-width: 200px;
    }

    .rating-bar-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .bar-track {
      flex: 1;
      height: 8px;
      background: var(--sic-color-border, #e2e8f0);
      border-radius: 999px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: #f59e0b;
      border-radius: 999px;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;
      box-sizing: border-box;
    }

    .review-item {
      padding: 1.25rem;
      border-radius: 14px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-bg, #ffffff);
      box-sizing: border-box;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .reviewer-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .reviewer-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .reviewer-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .reviewer-name {
      font-size: 0.9rem;
      color: var(--sic-color-text-active, #0f172a);
    }

    .review-date {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #94a3b8);
    }

    .reviewer-role {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .review-stars-row {
      margin-bottom: 0.5rem;
    }

    .review-stars {
      color: #d97706;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .review-comment {
      font-size: 0.88rem;
      color: var(--sic-color-text, #334155);
      line-height: 1.5;
      margin: 0;
      word-break: break-word;
    }

    /* 3.7 FAQ Section */
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .faq-item {
      padding: 1.25rem;
      background: var(--sic-color-surface, #f8fafc);
      border-radius: 12px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-sizing: border-box;
    }

    .faq-q {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.5rem 0;
    }

    .faq-a {
      font-size: 0.88rem;
      color: var(--sic-color-text, #334155);
      line-height: 1.55;
      margin: 0;
    }

    /* RIGHT COLUMN: Sticky Sidebar Card */
    .sticky-sidebar-card {
      position: sticky;
      top: 90px;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08);
      z-index: 10;
      width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 1080px) {
      .sticky-sidebar-card {
        position: static;
      }
    }

    .preview-media-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #0f172a;
      cursor: pointer;
      overflow: hidden;
    }

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .preview-media-wrapper:hover .preview-img {
      transform: scale(1.05);
    }

    .preview-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s ease;
    }

    .preview-media-wrapper:hover .preview-overlay {
      background: rgba(15, 23, 42, 0.6);
    }

    .play-btn-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #00a887;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 168, 135, 0.6);
      transition: transform 0.2s ease;
    }

    .preview-media-wrapper:hover .play-btn-circle {
      transform: scale(1.1);
    }

    .play-icon {
      font-size: 1.4rem;
      margin-left: 3px;
    }

    .preview-text {
      font-size: 0.8rem;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .sidebar-body {
      padding: clamp(1rem, 2vw, 1.5rem);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-sizing: border-box;
    }

    .status-box {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-sizing: border-box;
    }

    .price-free-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .free-badge {
      font-size: 1.05rem;
      font-weight: 800;
      color: #00a887;
    }

    .xp-reward {
      font-size: 0.85rem;
      font-weight: 800;
      color: #d97706;
      background: rgba(245, 158, 11, 0.15);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .status-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .status-tag {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }

    .tag-progress { background: rgba(0, 168, 135, 0.15); color: #00a887; }
    .tag-done { background: rgba(16, 185, 129, 0.15); color: #059669; }

    .progress-pct-num {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
    }

    .progress-bar-track {
      height: 8px;
      background: var(--sic-color-border, #e2e8f0);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar-val {
      height: 100%;
      background: linear-gradient(90deg, #00a887, #0284c7);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .progress-bar-val.bar-done {
      background: #10b981;
    }

    .last-lesson-hint {
      font-size: 0.78rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-primary-action {
      width: 100%;
      padding: 0.9rem 1.25rem;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      text-align: center;
      box-sizing: border-box;
    }

    .btn-enroll-main {
      background: #00a887;
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(0, 168, 135, 0.35);
    }

    .btn-enroll-main:hover {
      background: #009688;
      box-shadow: 0 6px 20px rgba(0, 168, 135, 0.5);
      transform: translateY(-1px);
    }

    .btn-resume-main {
      background: linear-gradient(135deg, #00a887, #0284c7);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(0, 168, 135, 0.35);
    }

    .btn-resume-main:hover {
      box-shadow: 0 6px 20px rgba(0, 168, 135, 0.5);
      transform: translateY(-1px);
    }

    .btn-cert-main {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
    }

    .btn-secondary-action {
      width: 100%;
      padding: 0.65rem 1rem;
      background: var(--sic-color-surface, #f1f5f9);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--sic-color-text, #334155);
      cursor: pointer;
      box-sizing: border-box;
      text-align: center;
    }

    .course-includes {
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      padding-top: 1rem;
      box-sizing: border-box;
    }

    .includes-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.75rem 0;
    }

    .includes-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .includes-list li {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: var(--sic-color-text, #334155);
    }

    .inc-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }

    .sidebar-secondary-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      border-top: 1px dashed var(--sic-color-border, #e2e8f0);
      padding-top: 1rem;
      box-sizing: border-box;
      width: 100%;
    }

    .btn-share {
      width: 100%;
      padding: 0.75rem 1rem;
      background: transparent;
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--sic-color-text, #334155);
      cursor: pointer;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      text-align: center;
    }

    .btn-share:hover {
      background: var(--sic-color-surface, #f1f5f9);
      border-color: #00a887;
      color: #00a887;
    }

    .btn-unenroll {
      background: transparent;
      border: none;
      font-size: 0.8rem;
      color: #ef4444;
      cursor: pointer;
      padding: 0.5rem;
      text-decoration: underline;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }

    /* Not Found */
    .not-found-container {
      text-align: center;
      padding: 5rem 2rem;
      background: var(--sic-color-bg, #ffffff);
      border-radius: 20px;
      border: 1px dashed var(--sic-color-border, #cbd5e1);
      margin: 3rem auto;
      max-width: 600px;
    }

    .not-found-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .btn-back-catalog {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      background: #00a887;
      color: #ffffff;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
    }

    /* Mobile & Tablet Specific Responsive Fixes */
    @media (max-width: 640px) {
      .lesson-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.6rem;
      }
      .lesson-right {
        width: 100%;
        justify-content: space-between;
        padding-left: 2rem;
        box-sizing: border-box;
      }
      .curriculum-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .reviews-summary-box {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
      }
      .rating-big-score {
        align-items: center;
      }
      .inst-card-top {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .inst-stats-row {
        justify-content: center;
      }
      .hero-meta-row {
        gap: 0.5rem;
      }
      .meta-pill {
        font-size: 0.75rem;
        padding: 0.35rem 0.65rem;
      }
    }
  `],
})
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesService = inject(CoursesService);

  readonly courseIdParam = signal<string>('');
  readonly activeTab = signal<'curriculum' | 'overview' | 'instructor' | 'reviews' | 'faq'>('curriculum');
  readonly expandedModules = signal<Set<string>>(new Set());
  readonly toastMessage = signal<string | null>(null);

  readonly course = computed<Course | undefined>(() => {
    const id = this.courseIdParam();
    if (!id) return undefined;
    return this.coursesService.getCourseByIdOrSlug(id);
  });

  readonly allExpanded = computed<boolean>(() => {
    const c = this.course();
    if (!c) return false;
    return c.modules.every((m) => this.expandedModules().has(m.id));
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.courseIdParam.set(id);
        // Expand all modules by default
        const currentCourse = this.coursesService.getCourseByIdOrSlug(id);
        if (currentCourse) {
          const modIds = new Set(currentCourse.modules.map((m) => m.id));
          this.expandedModules.set(modIds);
        }
      }
    });
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModules().has(moduleId);
  }

  toggleModule(moduleId: string): void {
    const next = new Set(this.expandedModules());
    if (next.has(moduleId)) {
      next.delete(moduleId);
    } else {
      next.add(moduleId);
    }
    this.expandedModules.set(next);
  }

  toggleAllModules(): void {
    const c = this.course();
    if (!c) return;

    if (this.allExpanded()) {
      this.expandedModules.set(new Set());
    } else {
      this.expandedModules.set(new Set(c.modules.map((m) => m.id)));
    }
  }

  getCategoryClass(category: string): string {
    switch (category) {
      case 'Software Engineering': return 'cat-software';
      case 'AI & Data': return 'cat-ai';
      case 'DevOps & Cloud': return 'cat-devops';
      case 'QA & Testing': return 'cat-qa';
      case 'HR & Onboarding': return 'cat-hr';
      case 'Management': return 'cat-mgmt';
      default: return '';
    }
  }

  getLessonTypeIcon(type: string): string {
    switch (type) {
      case 'video': return '🎬';
      case 'pdf': return '📄';
      case 'quiz': return '📝';
      case 'article': return '📖';
      default: return '📌';
    }
  }

  getLessonTypeLabel(type: string): string {
    switch (type) {
      case 'video': return 'วิดีโอบทเรียน';
      case 'pdf': return 'เอกสาร PDF';
      case 'quiz': return 'แบบทดสอบ';
      case 'article': return 'บทความอ่าน';
      default: return 'เนื้อหา';
    }
  }

  onEnrollCourse(): void {
    const c = this.course();
    if (!c) return;

    const ok = this.coursesService.enrollCourse(c.id);
    if (ok) {
      this.showToast(`🎉 ลงทะเบียนหลักสูตร "${c.title}" สำเร็จแล้ว! พร้อมเริ่มเรียนได้ทันที`);
    }
  }

  onUnenrollCourse(): void {
    const c = this.course();
    if (!c) return;

    const ok = this.coursesService.unenrollCourse(c.id);
    if (ok) {
      this.showToast(`ยกเลิกการลงทะเบียนหลักสูตร "${c.title}" เรียบร้อยแล้ว`);
    }
  }

  onToggleLesson(lessonId: string, event: Event): void {
    event.stopPropagation();
    const c = this.course();
    if (!c) return;

    if (c.enrolledStatus === 'not_enrolled') {
      this.showToast('กรุณากดลงทะเบียนเรียนก่อน เพื่อบันทึกความคืบหน้าของบทเรียนครับ');
      return;
    }

    this.coursesService.toggleLessonCompletion(c.id, lessonId);
    this.showToast('✓ อัปเดตสถานะบทเรียนเรียบร้อยแล้ว');
  }

  onStartLesson(lesson: CourseLesson, event: Event): void {
    event.stopPropagation();
    const c = this.course();
    if (!c) return;

    if (c.enrolledStatus === 'not_enrolled') {
      this.coursesService.enrollCourse(c.id);
    }

    if (lesson.type === 'quiz' && lesson.quizId) {
      this.router.navigate(['/courses', c.slug || c.id, 'quiz', lesson.quizId]);
    } else {
      this.router.navigate(['/courses', c.slug || c.id, 'learn', lesson.id]);
    }
  }

  onResumeLearning(): void {
    const c = this.course();
    if (!c) return;
    this.router.navigate(['/courses', c.slug || c.id, 'learn']);
  }

  onViewCertificate(): void {
    const c = this.course();
    if (!c) return;
    this.showToast(`🏆 กำลังเปิดใบประกาศนียบัตรดิจิทัลสำหรับ "${c.title}"... (Certificate Generator ใน Step 6)`);
  }

  onPreviewClick(): void {
    this.showToast('🎬 กำลังเล่นวิดีโอตัวอย่างหลักสูตร...');
  }

  onShareCourse(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      this.showToast('🔗 คัดลอกลิงก์หลักสูตรลงคลิปบอร์ดแล้ว!');
    } else {
      this.showToast('🔗 คัดลอกลิงก์เรียบร้อยแล้ว');
    }
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 4500);
  }
}

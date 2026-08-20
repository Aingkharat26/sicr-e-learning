import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="course-card"
      [class.list-mode]="viewMode === 'list'"
      [class.is-enrolled]="course.enrolledStatus !== 'not_enrolled'"
      [class.is-completed]="course.enrolledStatus === 'completed'"
    >
      <!-- Media / Thumbnail Header -->
      <div class="card-thumb-wrapper">
        <img [src]="course.thumbnail" [alt]="course.title" class="card-thumb" loading="lazy" />
        <div class="thumb-overlay"></div>

        <!-- Badges on Thumbnail -->
        <div class="thumb-badges-top">
          <span class="badge-category" [ngClass]="getCategoryClass(course.category)">
            {{ course.category }}
          </span>

          <span *ngIf="course.isMandatory" class="badge-mandatory">
            ★ คอร์สบังคับ
          </span>
        </div>

        <div class="thumb-badges-bottom">
          <span class="badge-level" [ngClass]="'level-' + course.level.toLowerCase()">
            {{ course.level }}
          </span>
          <span class="badge-xp">⚡ {{ course.xpAward }} XP</span>
        </div>
      </div>

      <!-- Card Body Content -->
      <div class="card-content">
        <!-- Instructor Info Row -->
        <div class="instructor-row">
          <img [src]="course.instructor.avatar" [alt]="course.instructor.name" class="inst-avatar" />
          <div class="inst-info">
            <span class="inst-name">{{ course.instructor.thaiName }}</span>
            <span class="inst-title">{{ course.instructor.title }}</span>
          </div>
        </div>

        <!-- Course Title & Description -->
        <h3 class="course-title" [title]="course.title">
          {{ course.title }}
        </h3>
        
        <p *ngIf="course.thaiTitle" class="course-thai-title">
          {{ course.thaiTitle }}
        </p>

        <p class="course-desc">
          {{ course.shortDescription }}
        </p>

        <!-- Tags Row -->
        <div class="tags-row">
          <span *ngFor="let tag of course.tags.slice(0, 3)" class="tag-pill">
            #{{ tag }}
          </span>
          <span *ngIf="course.tags.length > 3" class="tag-more">
            +{{ course.tags.length - 3 }}
          </span>
        </div>

        <!-- Metadata Metrics (Duration, Lessons, Rating, Enrolled) -->
        <div class="meta-metrics">
          <div class="meta-item" title="ระยะเวลาเรียน">
            <span class="meta-icon">⏱️</span>
            <span>{{ course.duration }}</span>
          </div>
          <div class="meta-item" title="จำนวนบทเรียน">
            <span class="meta-icon">📚</span>
            <span>{{ course.totalLessons }} บท</span>
          </div>
          <div class="meta-item rating-item" title="คะแนนรีวิว">
            <span class="star-icon">★</span>
            <strong class="rating-val">{{ course.rating }}</strong>
            <span class="rating-count">({{ course.ratingCount }})</span>
          </div>
          <div class="meta-item enrolled-item" title="ผู้ลงทะเบียนเรียน">
            <span class="meta-icon">👥</span>
            <span>{{ course.totalEnrolled }} คน</span>
          </div>
        </div>

        <!-- Progress Bar (If Enrolled) -->
        <div *ngIf="course.enrolledStatus !== 'not_enrolled'" class="progress-section">
          <div class="progress-info">
            <span class="progress-label">
              <span *ngIf="course.enrolledStatus === 'completed'" class="status-done">✓ เรียนจบแล้ว</span>
              <span *ngIf="course.enrolledStatus === 'in_progress'" class="status-progress">กำลังเรียน</span>
            </span>
            <span class="progress-pct">{{ course.userProgressPercent }}%</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-bar-fill"
              [style.width.%]="course.userProgressPercent"
              [class.bar-completed]="course.enrolledStatus === 'completed'"
            ></div>
          </div>
        </div>

        <!-- Action Buttons Footer -->
        <div class="card-actions">
          <ng-container [ngSwitch]="course.enrolledStatus">
            <!-- Case 1: Not Enrolled -->
            <ng-container *ngSwitchCase="'not_enrolled'">
              <button
                type="button"
                class="btn-action btn-enroll"
                (click)="onEnrollClick($event)"
              >
                <span>ลงทะเบียนเรียนฟรี</span>
                <span class="btn-arrow">→</span>
              </button>
            </ng-container>

            <!-- Case 2: In Progress -->
            <ng-container *ngSwitchCase="'in_progress'">
              <button
                type="button"
                class="btn-action btn-resume"
                (click)="onResumeClick($event)"
              >
                <span>▶ เรียนต่อ</span>
                <span class="btn-subtext">({{ course.userProgressPercent }}%)</span>
              </button>
            </ng-container>

            <!-- Case 3: Completed -->
            <ng-container *ngSwitchCase="'completed'">
              <button
                type="button"
                class="btn-action btn-review"
                (click)="onResumeClick($event)"
              >
                <span>🔄 ทบทวนบทเรียน</span>
              </button>
            </ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .course-card {
      display: flex;
      flex-direction: column;
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      overflow: hidden;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
      box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.04);
      position: relative;
      height: 100%;
      box-sizing: border-box;
    }

    .course-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 32px -6px rgba(0, 168, 135, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06);
      border-color: rgba(0, 168, 135, 0.45);
    }

    .course-card.is-enrolled {
      border-color: rgba(0, 168, 135, 0.3);
    }

    .course-card.is-completed {
      border-color: rgba(16, 185, 129, 0.35);
    }

    /* Thumbnail Area */
    .card-thumb-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #0f172a;
      overflow: hidden;
      flex-shrink: 0;
    }

    .card-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .course-card:hover .card-thumb {
      transform: scale(1.05);
    }

    .thumb-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0.1) 40%, rgba(15, 23, 42, 0.85) 100%);
      pointer-events: none;
    }

    .thumb-badges-top {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      right: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      z-index: 2;
    }

    .badge-category {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      backdrop-filter: blur(8px);
      white-space: nowrap;
      background: rgba(15, 23, 42, 0.75);
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .badge-category.cat-software {
      background: rgba(0, 168, 135, 0.85);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.3);
    }
    .badge-category.cat-ai {
      background: rgba(124, 58, 237, 0.85);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.3);
    }
    .badge-category.cat-devops {
      background: rgba(2, 132, 199, 0.85);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.3);
    }
    .badge-category.cat-qa {
      background: rgba(234, 88, 12, 0.85);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.3);
    }
    .badge-category.cat-hr {
      background: rgba(219, 39, 119, 0.85);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.3);
    }
    .badge-category.cat-mgmt {
      background: rgba(79, 70, 229, 0.85);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .badge-mandatory {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      background: #ef4444;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
      white-space: nowrap;
    }

    .thumb-badges-bottom {
      position: absolute;
      bottom: 0.75rem;
      left: 0.75rem;
      right: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
    }

    .badge-level {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      backdrop-filter: blur(8px);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .level-beginner {
      background: rgba(16, 185, 129, 0.9);
      color: #ffffff;
    }
    .level-intermediate {
      background: rgba(245, 158, 11, 0.9);
      color: #ffffff;
    }
    .level-advanced {
      background: rgba(220, 38, 38, 0.9);
      color: #ffffff;
    }

    .badge-xp {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.92);
      color: #0f172a;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    /* Content Area */
    .card-content {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 0.75rem;
      box-sizing: border-box;
    }

    .instructor-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .inst-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid #00a887;
      flex-shrink: 0;
    }

    .inst-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .inst-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .inst-title {
      font-size: 0.7rem;
      color: var(--sic-color-text-muted, #64748b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .course-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      line-height: 1.35;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.7rem;
      transition: color 0.2s ease;
    }

    .course-card:hover .course-title {
      color: #00a887;
    }

    .course-thai-title {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: -0.4rem 0 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .course-desc {
      font-size: 0.84rem;
      color: var(--sic-color-text, #334155);
      line-height: 1.45;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.1rem;
    }

    .tag-pill {
      font-size: 0.7rem;
      color: var(--sic-color-text-muted, #64748b);
      background: var(--sic-color-surface, #f1f5f9);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .tag-more {
      font-size: 0.68rem;
      color: var(--sic-color-text-muted, #94a3b8);
      padding: 0.15rem 0.3rem;
    }

    .meta-metrics {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding-top: 0.6rem;
      border-top: 1px dashed var(--sic-color-border, #e2e8f0);
      font-size: 0.78rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      white-space: nowrap;
    }

    .meta-icon {
      font-size: 0.85rem;
    }

    .rating-item {
      color: #d97706;
      font-weight: 700;
    }

    .star-icon {
      color: #f59e0b;
      font-size: 0.9rem;
    }

    .rating-val {
      color: var(--sic-color-text-active, #0f172a);
    }

    .rating-count {
      color: var(--sic-color-text-muted, #94a3b8);
      font-size: 0.72rem;
      font-weight: normal;
    }

    .enrolled-item {
      font-weight: 600;
    }

    /* Progress Section */
    .progress-section {
      background: var(--sic-color-surface, #f8fafc);
      padding: 0.6rem 0.75rem;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .status-progress {
      color: #00a887;
    }

    .status-done {
      color: #10b981;
    }

    .progress-pct {
      color: var(--sic-color-text-active, #0f172a);
    }

    .progress-track {
      height: 6px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #00a887, #10b981);
      border-radius: 999px;
      transition: width 0.4s ease;
    }

    .bar-completed {
      background: #10b981;
    }

    /* Actions Footer */
    .card-actions {
      margin-top: 0.25rem;
    }

    .btn-action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.7rem 1rem;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-enroll {
      background: #00a887;
      color: #ffffff;
    }

    .btn-enroll:hover {
      background: #009688;
      box-shadow: 0 4px 14px rgba(0, 168, 135, 0.4);
      transform: translateY(-1px);
    }

    .btn-resume {
      background: linear-gradient(135deg, #00a887, #0284c7);
      color: #ffffff;
    }

    .btn-resume:hover {
      box-shadow: 0 4px 14px rgba(0, 168, 135, 0.4);
      transform: translateY(-1px);
    }

    .btn-subtext {
      font-size: 0.78rem;
      opacity: 0.9;
    }

    .btn-review {
      background: var(--sic-color-surface, #f1f5f9);
      color: #007965;
      border: 1px solid rgba(0, 168, 135, 0.3);
    }

    .btn-review:hover {
      background: rgba(0, 168, 135, 0.15);
    }

    .btn-arrow {
      transition: transform 0.2s ease;
    }

    .btn-action:hover .btn-arrow {
      transform: translateX(4px);
    }

    /* List Mode Specific Layout */
    .course-card.list-mode {
      flex-direction: row;
      min-height: 220px;
    }

    .course-card.list-mode .card-thumb-wrapper {
      width: 320px;
      max-width: 38%;
      aspect-ratio: auto;
      height: 100%;
    }

    .course-card.list-mode .card-content {
      padding: 1.5rem;
      gap: 0.75rem;
    }

    .course-card.list-mode .course-title {
      min-height: auto;
      font-size: 1.2rem;
    }

    .course-card.list-mode .card-actions {
      max-width: 220px;
      align-self: flex-start;
      margin-top: 0.5rem;
    }

    @media (max-width: 900px) {
      .course-card.list-mode {
        flex-direction: column;
        min-height: auto;
      }
      .course-card.list-mode .card-thumb-wrapper {
        width: 100%;
        max-width: 100%;
        aspect-ratio: 16 / 9;
        height: auto;
      }
      .course-card.list-mode .card-actions {
        max-width: 100%;
        align-self: stretch;
      }
    }
  `],
})
export class CourseCardComponent {
  @Input({ required: true }) course!: Course;
  @Input() viewMode: 'grid' | 'list' = 'grid';

  @Output() enroll = new EventEmitter<string>();
  @Output() resume = new EventEmitter<string>();

  getCategoryClass(category: string): string {
    switch (category) {
      case 'Software Engineering':
        return 'cat-software';
      case 'AI & Data':
        return 'cat-ai';
      case 'DevOps & Cloud':
        return 'cat-devops';
      case 'QA & Testing':
        return 'cat-qa';
      case 'HR & Onboarding':
        return 'cat-hr';
      case 'Management':
        return 'cat-mgmt';
      default:
        return '';
    }
  }

  onEnrollClick(event: Event): void {
    event.stopPropagation();
    this.enroll.emit(this.course.id);
  }

  onResumeClick(event: Event): void {
    event.stopPropagation();
    this.resume.emit(this.course.id);
  }
}

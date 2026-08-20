import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../core/services/courses.service';
import { Course, CourseLesson, CourseModule } from '../../core/models/course.model';
import { SicVideoPlayerComponent } from 'sic-ng';

@Component({
  selector: 'app-classroom-player',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicVideoPlayerComponent],
  template: `
    <div class="classroom-page" *ngIf="course(); else notFound">
      <!-- Mobile Overlay Backdrop -->
      <div
        class="sidebar-backdrop"
        [class.visible]="sidebarOpen()"
        (click)="sidebarOpen.set(false)"
      ></div>

      <!-- MAIN CONTENT AREA -->
      <div class="classroom-main">
        <!-- Top Bar -->
        <div class="classroom-topbar">
          <a [routerLink]="['/courses', course()!.slug || course()!.id]" class="back-link">
            ← กลับไปหน้าหลักสูตร
          </a>
          <div class="topbar-center">
            <span class="topbar-course-title">{{ course()!.title }}</span>
          </div>
          <button
            type="button"
            class="btn-toggle-sidebar"
            (click)="sidebarOpen.set(!sidebarOpen())"
            [attr.aria-label]="sidebarOpen() ? 'ปิดรายการบทเรียน' : 'เปิดรายการบทเรียน'"
          >
            📋 <span class="toggle-text">รายการบทเรียน</span>
          </button>
        </div>

        <!-- Content Area -->
        <div class="content-area">
          <!-- VIDEO PLAYER -->
          <div class="player-wrapper" *ngIf="currentLesson()?.type === 'video'">
            <sic-video-player
              [src]="currentLesson()!.videoUrl || ''"
              [poster]="course()!.thumbnail"
            ></sic-video-player>
          </div>

          <!-- PDF/ARTICLE VIEWER -->
          <div class="content-viewer" *ngIf="currentLesson()?.type === 'pdf' || currentLesson()?.type === 'article'">
            <div class="content-viewer-header">
              <span class="content-type-icon">{{ currentLesson()?.type === 'pdf' ? '📄' : '📖' }}</span>
              <h2>{{ currentLesson()?.title }}</h2>
            </div>
            <div class="markdown-body" *ngIf="currentLesson()?.contentMarkdown">
              <pre class="markdown-content">{{ currentLesson()!.contentMarkdown }}</pre>
            </div>
            <div class="markdown-body placeholder-content" *ngIf="!currentLesson()?.contentMarkdown">
              <div class="placeholder-icon">{{ currentLesson()?.type === 'pdf' ? '📄' : '📖' }}</div>
              <h3>{{ currentLesson()?.title }}</h3>
              <p>เนื้อหาบทเรียนจะแสดงที่นี่เมื่อเชื่อมต่อกับระบบ Backend จริง</p>
            </div>
          </div>

          <!-- QUIZ PLACEHOLDER -->
          <div class="content-viewer quiz-placeholder" *ngIf="currentLesson()?.type === 'quiz'">
            <div class="quiz-box">
              <div class="quiz-icon">📝</div>
              <h2>{{ currentLesson()?.title }}</h2>
              <p class="quiz-desc">
                แบบทดสอบนี้ประกอบด้วยคำถามแบบปรนัยและถูก-ผิด เพื่อประเมินความเข้าใจตามมาตรฐานหลักสูตร เกณฑ์ผ่าน 80%
              </p>
              <div class="quiz-info-chips">
                <span class="qchip">🎯 เกณฑ์ผ่าน 80%</span>
                <span class="qchip">⏱️ มีเวลาจำกัด</span>
                <span class="qchip">✨ รับ XP พิเศษ</span>
              </div>
              <a
                [routerLink]="['/courses', course()!.slug || course()!.id, 'quiz', currentLesson()!.quizId || 'quiz-001']"
                class="btn-start-quiz"
              >
                🚀 เริ่มทำแบบทดสอบ (Take Assessment)
              </a>
            </div>
          </div>

          <!-- Lesson Info Bar -->
          <div class="lesson-info-bar">
            <div class="lesson-info-left">
              <span class="lesson-type-badge" [ngClass]="'type-' + currentLesson()?.type">
                {{ getLessonTypeIcon(currentLesson()?.type || 'video') }}
                {{ getLessonTypeLabel(currentLesson()?.type || 'video') }}
              </span>
              <h3 class="lesson-title">{{ currentLesson()?.title }}</h3>
              <span class="lesson-duration">⏱️ {{ currentLesson()?.duration }}</span>
            </div>
            <div class="lesson-info-right">
              <span *ngIf="currentLesson()?.isPreviewable" class="badge-preview">👁️ Preview</span>
              <span *ngIf="currentLesson()?.isCompleted" class="badge-completed">✓ เรียนจบแล้ว</span>
            </div>
          </div>

          <!-- Action Bar -->
          <div class="action-bar">
            <button
              type="button"
              class="btn-action btn-prev"
              [disabled]="!hasPrevLesson()"
              (click)="goToPrevLesson()"
            >
              ◀ บทเรียนก่อนหน้า
            </button>

            <button
              type="button"
              class="btn-action btn-complete"
              [class.completed]="currentLesson()?.isCompleted"
              (click)="toggleComplete()"
            >
              {{ currentLesson()?.isCompleted ? '✓ เรียนจบแล้ว' : '☐ ทำเครื่องหมายเรียนจบ' }}
            </button>

            <button
              type="button"
              class="btn-action btn-next"
              [disabled]="!hasNextLesson()"
              (click)="goToNextLesson()"
            >
              บทเรียนถัดไป ▶
            </button>
          </div>

          <!-- Tabs Below Player -->
          <div class="below-tabs">
            <div class="tab-nav">
              <button
                type="button"
                class="tab-btn"
                [class.active]="activeTab() === 'notes'"
                (click)="activeTab.set('notes')"
              >
                📝 บันทึกส่วนตัว
              </button>
              <button
                type="button"
                class="tab-btn"
                [class.active]="activeTab() === 'resources'"
                (click)="activeTab.set('resources')"
              >
                📄 เอกสารประกอบ
              </button>
              <button
                type="button"
                class="tab-btn"
                [class.active]="activeTab() === 'info'"
                (click)="activeTab.set('info')"
              >
                ℹ️ รายละเอียดหลักสูตร
              </button>
            </div>

            <!-- Tab: Notes -->
            <div class="tab-content" *ngIf="activeTab() === 'notes'">
              <div class="notes-section">
                <textarea
                  class="notes-textarea"
                  [ngModel]="notesText()"
                  (ngModelChange)="notesText.set($event)"
                  placeholder="จดบันทึกส่วนตัวขณะเรียนที่นี่... (ข้อมูลเก็บไว้ชั่วคราวใน Session นี้เท่านั้น)"
                  rows="6"
                ></textarea>
              </div>
            </div>

            <!-- Tab: Resources -->
            <div class="tab-content" *ngIf="activeTab() === 'resources'">
              <div class="resources-list">
                <div class="resource-item" *ngFor="let mod of course()!.modules">
                  <div class="resource-group-title">📁 {{ mod.title }}</div>
                  <div class="resource-sub" *ngFor="let les of mod.lessons">
                    <span class="resource-icon">{{ getLessonTypeIcon(les.type) }}</span>
                    <span class="resource-name">{{ les.title }}</span>
                    <span class="resource-dur">{{ les.duration }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Course Info -->
            <div class="tab-content" *ngIf="activeTab() === 'info'">
              <div class="course-info-card">
                <div class="info-header">
                  <img [src]="course()!.thumbnail" alt="" class="info-thumb" />
                  <div class="info-details">
                    <h3>{{ course()!.title }}</h3>
                    <p *ngIf="course()!.thaiTitle" class="thai-title">{{ course()!.thaiTitle }}</p>
                    <p class="info-desc">{{ course()!.shortDescription }}</p>
                    <div class="info-meta">
                      <span>👨‍🏫 {{ course()!.instructor.thaiName }}</span>
                      <span>⏱️ {{ course()!.duration }}</span>
                      <span>📚 {{ course()!.totalLessons }} บทเรียน</span>
                      <span>★ {{ course()!.rating }}</span>
                    </div>
                    <a [routerLink]="['/courses', course()!.slug || course()!.id]" class="link-back">
                      ← ดูรายละเอียดหลักสูตรทั้งหมด
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SIDEBAR PLAYLIST -->
      <aside class="classroom-sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <h2 class="sidebar-course-title">{{ course()!.title }}</h2>
            <button
              type="button"
              class="btn-close-sidebar"
              (click)="sidebarOpen.set(false)"
              aria-label="ปิดรายการ"
            >✕</button>
          </div>
          <div class="sidebar-progress">
            <div class="progress-info">
              <span>ความคืบหน้า</span>
              <strong>{{ course()!.userProgressPercent }}%</strong>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                [style.width.%]="course()!.userProgressPercent"
              ></div>
            </div>
            <div class="progress-stat">
              {{ completedLessonCount() }} / {{ totalLessonCount() }} บทเรียนที่เรียนจบ
            </div>
          </div>
        </div>

        <div class="sidebar-modules">
          <div
            *ngFor="let mod of course()!.modules; let mIdx = index"
            class="sidebar-module"
          >
            <button
              type="button"
              class="module-header"
              (click)="toggleModule(mod.id)"
              [class.expanded]="isModuleExpanded(mod.id)"
            >
              <div class="module-header-left">
                <span class="module-chevron">{{ isModuleExpanded(mod.id) ? '▾' : '▸' }}</span>
                <span class="module-label">{{ mod.title }}</span>
              </div>
              <span class="module-count">
                {{ getModuleCompletedCount(mod) }}/{{ mod.lessons.length }}
              </span>
            </button>

            <div class="module-lessons" *ngIf="isModuleExpanded(mod.id)">
              <button
                *ngFor="let les of mod.lessons"
                type="button"
                class="lesson-item"
                [class.active]="currentLesson()?.id === les.id"
                [class.completed]="les.isCompleted"
                (click)="selectLesson(les)"
              >
                <span class="lesson-check">
                  {{ les.isCompleted ? '✓' : '○' }}
                </span>
                <span class="lesson-icon">{{ getLessonTypeIcon(les.type) }}</span>
                <span class="lesson-name">{{ les.title }}</span>
                <span class="lesson-dur">{{ les.duration }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="sidebar-footer">
          <a [routerLink]="['/courses', course()!.slug || course()!.id]" class="btn-back-detail">
            ← กลับหน้าหลักสูตร
          </a>
        </div>
      </aside>
    </div>

    <ng-template #notFound>
      <div class="not-found-page">
        <div class="not-found-content">
          <span class="nf-icon">📚</span>
          <h2>ไม่พบหลักสูตรที่ระบุ</h2>
          <p>หลักสูตรนี้อาจถูกลบออกหรือลิงก์ไม่ถูกต้อง</p>
          <a routerLink="/courses" class="btn-back-catalog">← กลับไปยังคลังหลักสูตร</a>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    /* ========== CLASSROOM LAYOUT ========== */
    .classroom-page {
      display: flex;
      width: 100%;
      min-height: calc(100vh - 64px);
      background: var(--sic-color-bg, #f1f5f9);
      position: relative;
    }

    .classroom-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    /* ========== TOP BAR ========== */
    .classroom-topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      background: var(--sic-color-surface, #ffffff);
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .back-link {
      font-size: 0.85rem;
      color: var(--sic-color-primary, #00a887);
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      font-weight: 500;
      transition: opacity 0.15s;
    }
    .back-link:hover { opacity: 0.8; }

    .topbar-center {
      flex: 1;
      min-width: 0;
      text-align: center;
    }

    .topbar-course-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--sic-color-text, #1e293b);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }

    .btn-toggle-sidebar {
      display: none;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: var(--sic-color-primary, #00a887);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .btn-toggle-sidebar:hover { background: #009478; }

    /* ========== CONTENT AREA ========== */
    .content-area {
      flex: 1;
      padding: 0;
      overflow-y: auto;
    }

    /* VIDEO PLAYER */
    .player-wrapper {
      width: 100%;
      background: #000;
    }
    .player-wrapper sic-video-player {
      display: block;
      width: 100%;
    }

    /* CONTENT VIEWER (PDF/Article) */
    .content-viewer {
      width: 100%;
      min-height: 380px;
      display: flex;
      flex-direction: column;
      background: var(--sic-color-surface, #ffffff);
    }
    .content-viewer-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 28px 16px;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .content-type-icon {
      font-size: 1.6rem;
    }
    .content-viewer-header h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
    }
    .markdown-body {
      padding: 24px 28px;
      flex: 1;
    }
    .markdown-content {
      white-space: pre-wrap;
      font-family: var(--sic-font-sans, 'Inter', system-ui, sans-serif);
      font-size: 0.92rem;
      line-height: 1.75;
      color: var(--sic-color-text-secondary, #475569);
      margin: 0;
      background: transparent;
      border: none;
    }
    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      text-align: center;
      gap: 12px;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .placeholder-icon {
      font-size: 4rem;
      opacity: 0.4;
    }
    .placeholder-content h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--sic-color-text, #1e293b);
    }
    .placeholder-content p {
      margin: 0;
      font-size: 0.9rem;
    }

    /* QUIZ PLACEHOLDER */
    .quiz-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 420px;
      background: linear-gradient(135deg, rgba(0,168,135,0.05), rgba(16,185,129,0.08));
    }
    .quiz-box {
      text-align: center;
      padding: 48px;
      background: var(--sic-color-surface, #ffffff);
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      max-width: 500px;
    }
    .quiz-icon { font-size: 4rem; margin-bottom: 16px; }
    .quiz-box h2 {
      margin: 0 0 12px;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
    }
    .quiz-desc {
      margin: 0 0 24px;
      font-size: 0.92rem;
      color: var(--sic-color-text-secondary, #64748b);
      line-height: 1.6;
    }
    .quiz-info-chips {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .qchip {
      background: var(--sic-color-bg, #f1f5f9);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--sic-color-text-secondary, #475569);
    }
    .btn-start-quiz {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 32px;
      background: linear-gradient(135deg, #00a887, #10b981);
      color: #fff;
      text-decoration: none;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn-start-quiz:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0,168,135,0.3);
    }

    /* ========== LESSON INFO BAR ========== */
    .lesson-info-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 24px;
      background: var(--sic-color-surface, #ffffff);
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      flex-wrap: wrap;
    }
    .lesson-info-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      min-width: 0;
    }
    .lesson-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .type-video { background: #dbeafe; color: #1e40af; }
    .type-pdf { background: #fce7f3; color: #9d174d; }
    .type-article { background: #fef3c7; color: #92400e; }
    .type-quiz { background: #ede9fe; color: #5b21b6; }

    .lesson-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
      min-width: 0;
    }
    .lesson-duration {
      font-size: 0.82rem;
      color: var(--sic-color-text-secondary, #64748b);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .lesson-info-right {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .badge-preview, .badge-completed {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge-preview { background: #e0f2fe; color: #0369a1; }
    .badge-completed { background: #d1fae5; color: #065f46; }

    /* ========== ACTION BAR ========== */
    .action-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px 24px;
      background: var(--sic-color-surface, #ffffff);
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
      background: var(--sic-color-surface, #ffffff);
      color: var(--sic-color-text, #1e293b);
    }
    .btn-action:hover:not(:disabled) {
      border-color: var(--sic-color-primary, #00a887);
      color: var(--sic-color-primary, #00a887);
    }
    .btn-action:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .btn-complete {
      background: linear-gradient(135deg, #00a887, #10b981);
      color: #fff;
      border-color: transparent;
    }
    .btn-complete:hover:not(:disabled) {
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,168,135,0.3);
    }
    .btn-complete.completed {
      background: linear-gradient(135deg, #059669, #10b981);
    }

    /* ========== BELOW TABS ========== */
    .below-tabs {
      background: var(--sic-color-surface, #ffffff);
      margin: 0;
    }
    .tab-nav {
      display: flex;
      gap: 0;
      border-bottom: 2px solid var(--sic-color-border, #e2e8f0);
      padding: 0 24px;
    }
    .tab-btn {
      padding: 14px 20px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--sic-color-text-secondary, #64748b);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .tab-btn:hover { color: var(--sic-color-primary, #00a887); }
    .tab-btn.active {
      color: var(--sic-color-primary, #00a887);
      border-bottom-color: var(--sic-color-primary, #00a887);
    }
    .tab-content {
      padding: 24px;
    }

    /* Notes */
    .notes-textarea {
      width: 100%;
      padding: 16px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 10px;
      font-family: var(--sic-font-sans, 'Inter', system-ui, sans-serif);
      font-size: 0.92rem;
      line-height: 1.6;
      resize: vertical;
      background: var(--sic-color-bg, #f8fafc);
      color: var(--sic-color-text, #1e293b);
      transition: border-color 0.15s;
    }
    .notes-textarea:focus {
      outline: none;
      border-color: var(--sic-color-primary, #00a887);
      box-shadow: 0 0 0 3px rgba(0,168,135,0.1);
    }

    /* Resources */
    .resources-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .resource-group-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
      margin-bottom: 8px;
    }
    .resource-sub {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      color: var(--sic-color-text-secondary, #475569);
      transition: background 0.1s;
    }
    .resource-sub:hover {
      background: var(--sic-color-bg, #f1f5f9);
    }
    .resource-icon { flex-shrink: 0; }
    .resource-name { flex: 1; min-width: 0; }
    .resource-dur {
      font-size: 0.78rem;
      color: var(--sic-color-text-secondary, #94a3b8);
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Course Info */
    .course-info-card {
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 12px;
      overflow: hidden;
    }
    .info-header {
      display: flex;
      gap: 20px;
      padding: 20px;
    }
    .info-thumb {
      width: 200px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      flex-shrink: 0;
    }
    .info-details { flex: 1; min-width: 0; }
    .info-details h3 {
      margin: 0 0 4px;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
    }
    .thai-title {
      margin: 0 0 8px;
      font-size: 0.85rem;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .info-desc {
      margin: 0 0 12px;
      font-size: 0.88rem;
      line-height: 1.5;
      color: var(--sic-color-text-secondary, #475569);
    }
    .info-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.82rem;
      color: var(--sic-color-text-secondary, #64748b);
      margin-bottom: 12px;
    }
    .link-back {
      font-size: 0.85rem;
      color: var(--sic-color-primary, #00a887);
      text-decoration: none;
      font-weight: 600;
    }
    .link-back:hover { text-decoration: underline; }

    /* ========== SIDEBAR ========== */
    .classroom-sidebar {
      width: 360px;
      flex-shrink: 0;
      background: var(--sic-color-surface, #ffffff);
      border-left: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      flex-direction: column;
      height: calc(100vh - 64px);
      position: sticky;
      top: 64px;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .sidebar-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 16px;
    }
    .sidebar-course-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
      line-height: 1.3;
    }
    .btn-close-sidebar {
      display: none;
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--sic-color-text-secondary, #64748b);
      padding: 4px;
      flex-shrink: 0;
    }

    .sidebar-progress {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .progress-info strong {
      color: var(--sic-color-primary, #00a887);
    }
    .progress-track {
      height: 8px;
      border-radius: 4px;
      background: var(--sic-color-bg, #e2e8f0);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00a887, #10b981);
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    .progress-stat {
      font-size: 0.78rem;
      color: var(--sic-color-text-secondary, #94a3b8);
    }

    /* Sidebar Modules */
    .sidebar-modules {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }
    .sidebar-module {
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .module-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 14px 20px;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      color: var(--sic-color-text, #1e293b);
      transition: background 0.1s;
    }
    .module-header:hover {
      background: var(--sic-color-bg, #f8fafc);
    }
    .module-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .module-chevron {
      font-size: 0.85rem;
      flex-shrink: 0;
      width: 16px;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .module-label {
      font-size: 0.82rem;
      font-weight: 700;
      line-height: 1.3;
      min-width: 0;
    }
    .module-count {
      font-size: 0.75rem;
      color: var(--sic-color-text-secondary, #94a3b8);
      white-space: nowrap;
      flex-shrink: 0;
      background: var(--sic-color-bg, #f1f5f9);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .module-lessons {
      padding: 0 0 8px;
    }
    .lesson-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 20px 10px 32px;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      font-size: 0.82rem;
      color: var(--sic-color-text-secondary, #475569);
      transition: all 0.12s;
      line-height: 1.35;
    }
    .lesson-item:hover {
      background: var(--sic-color-bg, #f1f5f9);
    }
    .lesson-item.active {
      background: rgba(0,168,135,0.08);
      color: var(--sic-color-primary, #00a887);
      border-left: 3px solid var(--sic-color-primary, #00a887);
      font-weight: 700;
    }
    .lesson-item.completed .lesson-check {
      color: #10b981;
    }
    .lesson-check {
      flex-shrink: 0;
      width: 18px;
      text-align: center;
      font-size: 0.85rem;
    }
    .lesson-icon {
      flex-shrink: 0;
    }
    .lesson-name {
      flex: 1;
      min-width: 0;
    }
    .lesson-dur {
      font-size: 0.72rem;
      color: var(--sic-color-text-secondary, #94a3b8);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .btn-back-detail {
      display: block;
      text-align: center;
      padding: 10px;
      background: var(--sic-color-bg, #f1f5f9);
      color: var(--sic-color-primary, #00a887);
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      transition: background 0.15s;
    }
    .btn-back-detail:hover {
      background: rgba(0,168,135,0.08);
    }

    /* ========== MOBILE SIDEBAR ========== */
    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 90;
      opacity: 0;
      transition: opacity 0.25s;
    }
    .sidebar-backdrop.visible {
      opacity: 1;
    }

    /* ========== NOT FOUND ========== */
    .not-found-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 40px;
    }
    .not-found-content {
      text-align: center;
    }
    .nf-icon { font-size: 4rem; }
    .not-found-content h2 {
      margin: 16px 0 8px;
      font-size: 1.3rem;
      color: var(--sic-color-text, #1e293b);
    }
    .not-found-content p {
      margin: 0 0 24px;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .btn-back-catalog {
      display: inline-block;
      padding: 12px 28px;
      background: var(--sic-color-primary, #00a887);
      color: #fff;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 1023px) {
      .classroom-sidebar {
        position: fixed;
        top: 0;
        right: -400px;
        width: min(380px, 90vw);
        height: 100vh;
        z-index: 100;
        transition: right 0.3s ease;
        box-shadow: -4px 0 24px rgba(0,0,0,0.15);
      }
      .classroom-sidebar.open {
        right: 0;
      }
      .btn-toggle-sidebar {
        display: inline-flex;
      }
      .btn-close-sidebar {
        display: block;
      }
      .sidebar-backdrop {
        display: block;
      }
      .sidebar-backdrop:not(.visible) {
        pointer-events: none;
      }
      .topbar-center { display: none; }
    }

    @media (max-width: 640px) {
      .classroom-topbar {
        padding: 8px 12px;
      }
      .back-link {
        font-size: 0.8rem;
      }
      .toggle-text { display: none; }
      .lesson-info-bar {
        padding: 12px 16px;
        flex-direction: column;
        align-items: flex-start;
      }
      .action-bar {
        padding: 12px 16px;
        gap: 8px;
      }
      .btn-action {
        padding: 8px 12px;
        font-size: 0.78rem;
      }
      .tab-nav {
        padding: 0 12px;
        overflow-x: auto;
      }
      .tab-btn {
        padding: 12px 14px;
        font-size: 0.8rem;
      }
      .tab-content {
        padding: 16px;
      }
      .info-header {
        flex-direction: column;
      }
      .info-thumb {
        width: 100%;
        height: 160px;
      }
    }

    /* ========== DARK MODE ========== */
    :host-context(.sic-theme-dark) .classroom-page,
    :host-context([data-theme='dark']) .classroom-page {
      background: #0c1222;
    }
    :host-context(.sic-theme-dark) .classroom-topbar,
    :host-context([data-theme='dark']) .classroom-topbar {
      background: #111827;
      border-color: #1e293b;
    }
    :host-context(.sic-theme-dark) .classroom-sidebar,
    :host-context([data-theme='dark']) .classroom-sidebar {
      background: #111827;
      border-color: #1e293b;
    }
    :host-context(.sic-theme-dark) .content-viewer,
    :host-context([data-theme='dark']) .content-viewer {
      background: #111827;
    }
    :host-context(.sic-theme-dark) .lesson-info-bar,
    :host-context(.sic-theme-dark) .action-bar,
    :host-context(.sic-theme-dark) .below-tabs,
    :host-context([data-theme='dark']) .lesson-info-bar,
    :host-context([data-theme='dark']) .action-bar,
    :host-context([data-theme='dark']) .below-tabs {
      background: #111827;
      border-color: #1e293b;
    }
    :host-context(.sic-theme-dark) .btn-action,
    :host-context([data-theme='dark']) .btn-action {
      background: #1e293b;
      border-color: #334155;
      color: #e2e8f0;
    }
    :host-context(.sic-theme-dark) .tab-nav,
    :host-context([data-theme='dark']) .tab-nav {
      border-color: #1e293b;
    }
    :host-context(.sic-theme-dark) .notes-textarea,
    :host-context([data-theme='dark']) .notes-textarea {
      background: #0c1222;
      border-color: #334155;
      color: #e2e8f0;
    }
    :host-context(.sic-theme-dark) .module-header:hover,
    :host-context([data-theme='dark']) .module-header:hover {
      background: #1e293b;
    }
    :host-context(.sic-theme-dark) .lesson-item:hover,
    :host-context([data-theme='dark']) .lesson-item:hover {
      background: #1e293b;
    }
    :host-context(.sic-theme-dark) .quiz-box,
    :host-context([data-theme='dark']) .quiz-box {
      background: #1e293b;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    }
    :host-context(.sic-theme-dark) .course-info-card,
    :host-context([data-theme='dark']) .course-info-card {
      border-color: #334155;
    }
    :host-context(.sic-theme-dark) .sidebar-module,
    :host-context([data-theme='dark']) .sidebar-module {
      border-color: #1e293b;
    }
    :host-context(.sic-theme-dark) .progress-track,
    :host-context([data-theme='dark']) .progress-track {
      background: #1e293b;
    }
  `],
})
export class ClassroomPlayerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesService = inject(CoursesService);

  // State
  readonly course = signal<Course | undefined>(undefined);
  readonly currentLesson = signal<CourseLesson | undefined>(undefined);
  readonly sidebarOpen = signal(false);
  readonly activeTab = signal<'notes' | 'resources' | 'info'>('notes');
  readonly notesText = signal('');
  readonly expandedModules = signal<Set<string>>(new Set());

  // Computed
  readonly totalLessonCount = computed(() => {
    const c = this.course();
    if (!c) return 0;
    return c.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  });

  readonly completedLessonCount = computed(() => {
    const c = this.course();
    if (!c) return 0;
    return c.modules.reduce(
      (sum, m) => sum + m.lessons.filter((l) => l.isCompleted).length,
      0
    );
  });

  // Flat lesson list for navigation
  private readonly flatLessons = computed<CourseLesson[]>(() => {
    const c = this.course();
    if (!c) return [];
    return c.modules.flatMap((m) => m.lessons);
  });

  private readonly currentIndex = computed(() => {
    const current = this.currentLesson();
    if (!current) return -1;
    return this.flatLessons().findIndex((l) => l.id === current.id);
  });

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    const lessonId = this.route.snapshot.paramMap.get('lessonId');

    if (!courseId) return;

    const found = this.coursesService.getCourseByIdOrSlug(courseId);
    if (!found) return;

    // Auto-enroll if not enrolled
    if (found.enrolledStatus === 'not_enrolled') {
      this.coursesService.enrollCourse(found.id);
      // Re-fetch after enroll
      const updated = this.coursesService.getCourseByIdOrSlug(courseId);
      if (updated) this.course.set(updated);
    } else {
      this.course.set(found);
    }

    // Determine initial lesson
    const c = this.course();
    if (!c) return;

    let initialLesson: CourseLesson | undefined;

    if (lessonId) {
      // Find specific lesson
      for (const mod of c.modules) {
        initialLesson = mod.lessons.find((l) => l.id === lessonId);
        if (initialLesson) break;
      }
    }

    if (!initialLesson) {
      // Default: first uncompleted lesson, or first lesson
      for (const mod of c.modules) {
        initialLesson = mod.lessons.find((l) => !l.isCompleted);
        if (initialLesson) break;
      }
      if (!initialLesson && c.modules.length > 0 && c.modules[0].lessons.length > 0) {
        initialLesson = c.modules[0].lessons[0];
      }
    }

    if (initialLesson) {
      this.currentLesson.set(initialLesson);
      // Expand the module containing the initial lesson
      this.expandModuleContainingLesson(initialLesson.id);
    }

    // Expand all modules by default
    const allIds = new Set(c.modules.map((m) => m.id));
    this.expandedModules.set(allIds);
  }

  // Module accordion
  isModuleExpanded(modId: string): boolean {
    return this.expandedModules().has(modId);
  }

  toggleModule(modId: string): void {
    const current = new Set(this.expandedModules());
    if (current.has(modId)) {
      current.delete(modId);
    } else {
      current.add(modId);
    }
    this.expandedModules.set(current);
  }

  expandModuleContainingLesson(lessonId: string): void {
    const c = this.course();
    if (!c) return;
    for (const mod of c.modules) {
      if (mod.lessons.some((l) => l.id === lessonId)) {
        const current = new Set(this.expandedModules());
        current.add(mod.id);
        this.expandedModules.set(current);
        break;
      }
    }
  }

  getModuleCompletedCount(mod: CourseModule): number {
    return mod.lessons.filter((l) => l.isCompleted).length;
  }

  // Lesson navigation
  selectLesson(lesson: CourseLesson): void {
    this.currentLesson.set(lesson);
    this.expandModuleContainingLesson(lesson.id);
    this.sidebarOpen.set(false);
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hasNextLesson(): boolean {
    return this.currentIndex() < this.flatLessons().length - 1;
  }

  hasPrevLesson(): boolean {
    return this.currentIndex() > 0;
  }

  goToNextLesson(): void {
    const idx = this.currentIndex();
    const lessons = this.flatLessons();
    if (idx < lessons.length - 1) {
      this.selectLesson(lessons[idx + 1]);
    }
  }

  goToPrevLesson(): void {
    const idx = this.currentIndex();
    const lessons = this.flatLessons();
    if (idx > 0) {
      this.selectLesson(lessons[idx - 1]);
    }
  }

  // Toggle completion
  toggleComplete(): void {
    const c = this.course();
    const les = this.currentLesson();
    if (!c || !les) return;

    this.coursesService.toggleLessonCompletion(c.id, les.id);

    // Re-fetch to get updated state
    const updated = this.coursesService.getCourseByIdOrSlug(c.id);
    if (updated) {
      this.course.set(updated);
      // Update current lesson reference
      for (const mod of updated.modules) {
        const updatedLes = mod.lessons.find((l) => l.id === les.id);
        if (updatedLes) {
          this.currentLesson.set(updatedLes);
          break;
        }
      }
    }
  }

  // Helpers
  getLessonTypeIcon(type: string): string {
    switch (type) {
      case 'video': return '🎬';
      case 'pdf': return '📄';
      case 'article': return '📖';
      case 'quiz': return '📝';
      default: return '📚';
    }
  }

  getLessonTypeLabel(type: string): string {
    switch (type) {
      case 'video': return 'วิดีโอ';
      case 'pdf': return 'เอกสาร PDF';
      case 'article': return 'บทความ';
      case 'quiz': return 'แบบทดสอบ';
      default: return 'บทเรียน';
    }
  }
}

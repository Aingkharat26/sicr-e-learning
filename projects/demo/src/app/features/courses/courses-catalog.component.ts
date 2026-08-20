import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CoursesService } from '../../core/services/courses.service';
import { CourseCardComponent } from './components/course-card.component';
import { CourseCategory, CourseLevel, EnrollmentStatus } from '../../core/models/course.model';

@Component({
  selector: 'app-courses-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CourseCardComponent],
  template: `
    <div class="catalog-page">
      <!-- 1. Toast Notification Banner -->
      <div *ngIf="toastMessage()" class="toast-floating" [class.toast-show]="toastMessage()">
        <div class="toast-content">
          <span class="toast-icon">✨</span>
          <div class="toast-text">
            <strong>แจ้งเตือนจากระบบ</strong>
            <span>{{ toastMessage() }}</span>
          </div>
        </div>
        <button type="button" class="toast-close" (click)="toastMessage.set(null)">✕</button>
      </div>

      <!-- 2. Hero Header Section -->
      <section class="hero-catalog">
        <div class="hero-bg-shapes"></div>
        <div class="hero-inner">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            <span>SICR LEARNING MANAGEMENT SYSTEM • SOFT INTER CHIANGRAI</span>
          </div>

          <h1 class="hero-title">
            คลังหลักสูตรพัฒนาทักษะวิชาชีพ <span class="highlight">(Course Catalog)</span>
          </h1>

          <p class="hero-sub">
            ศูนย์รวมหลักสูตรออนไลน์มาตรฐาน ยกระดับความเชี่ยวชาญด้าน Frontend, Backend, AI, DevOps, QA 
            และทักษะการทำงานของพนักงาน Soft Inter Chiangrai ทุกฝ่าย
          </p>

          <!-- KPI Metric Pills -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-icon">📚</span>
              <div class="kpi-detail">
                <span class="kpi-val">{{ totalCoursesCount() }}</span>
                <span class="kpi-label">หลักสูตรทั้งหมด</span>
              </div>
            </div>

            <div class="kpi-card highlight-kpi">
              <span class="kpi-icon">🛡️</span>
              <div class="kpi-detail">
                <span class="kpi-val">{{ mandatoryCount() }}</span>
                <span class="kpi-label">คอร์สบังคับ</span>
              </div>
            </div>

            <div class="kpi-card">
              <span class="kpi-icon">🎒</span>
              <div class="kpi-detail">
                <span class="kpi-val">{{ enrolledCount() }}</span>
                <span class="kpi-label">ลงทะเบียนแล้ว</span>
              </div>
            </div>

            <div class="kpi-card">
              <span class="kpi-icon">⚡</span>
              <div class="kpi-detail">
                <span class="kpi-val">{{ totalXpSum() | number }}</span>
                <span class="kpi-label">XP รวมในระบบ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Category Filter Chips (Horizontal Scrollable) -->
      <section class="category-tabs-section">
        <div class="category-tabs-wrapper">
          <button
            *ngFor="let cat of categoryOptions()"
            type="button"
            class="cat-tab-btn"
            [class.active]="selectedCategory() === cat.id"
            (click)="onSelectCategory(cat.id)"
          >
            <span class="tab-icon">{{ cat.icon }}</span>
            <span class="tab-label">{{ cat.label }}</span>
            <span class="tab-count">{{ cat.count }}</span>
          </button>
        </div>
      </section>

      <!-- 4. Search and Multi-Filter Control Toolbar -->
      <section class="toolbar-section">
        <div class="toolbar-card">
          <!-- Search Box -->
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              placeholder="ค้นหาชื่อคอร์ส, ภาษา, ผู้สอน, หรือคีย์เวิร์ด (เช่น Signals, AI, QA)..."
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchInput($event)"
            />
            <button
              *ngIf="searchQuery()"
              type="button"
              class="search-clear-btn"
              (click)="onClearSearch()"
              title="ล้างคำค้นหา"
            >
              ✕
            </button>
          </div>

          <!-- Filter Dropdowns Row -->
          <div class="filters-actions-group">
            <!-- Level Filter Dropdown -->
            <div class="filter-select-wrapper">
              <label class="filter-label">ระดับความยาก</label>
              <select
                class="filter-select"
                [ngModel]="selectedLevel()"
                (ngModelChange)="onLevelChange($event)"
              >
                <option value="All">ทุกระดับความยาก</option>
                <option value="Beginner">🟢 Beginner (เบื้องต้น)</option>
                <option value="Intermediate">🟡 Intermediate (ปานกลาง)</option>
                <option value="Advanced">🔴 Advanced (ขั้นสูง)</option>
              </select>
            </div>

            <!-- Status Filter Dropdown -->
            <div class="filter-select-wrapper">
              <label class="filter-label">สถานะของฉัน</label>
              <select
                class="filter-select"
                [ngModel]="selectedStatus()"
                (ngModelChange)="onStatusChange($event)"
              >
                <option value="All">ทุกสถานะ</option>
                <option value="not_enrolled">ยังไม่ได้ลงทะเบียน</option>
                <option value="in_progress">กำลังเรียนอยู่</option>
                <option value="completed">เรียนจบแล้ว</option>
              </select>
            </div>

            <!-- Sort By Dropdown -->
            <div class="filter-select-wrapper">
              <label class="filter-label">เรียงตาม</label>
              <select
                class="filter-select"
                [ngModel]="sortBy()"
                (ngModelChange)="onSortChange($event)"
              >
                <option value="popular">🔥 ยอดนิยมสูงสุด</option>
                <option value="rating">★ คะแนนรีวิวสูงสุด</option>
                <option value="duration">⏱️ เวลาเรียนสั้น-ยาว</option>
                <option value="newest">✨ คอร์สใหม่ล่าสุด</option>
              </select>
            </div>

            <!-- View Switcher (Grid / List) -->
            <div class="view-switch-wrapper">
              <label class="filter-label">มุมมอง</label>
              <div class="view-switch-btns">
                <button
                  type="button"
                  class="switch-btn"
                  [class.active]="viewMode() === 'grid'"
                  (click)="onViewModeChange('grid')"
                  title="Grid View (มุมมองตารางการ์ด)"
                >
                  ⊞
                </button>
                <button
                  type="button"
                  class="switch-btn"
                  [class.active]="viewMode() === 'list'"
                  (click)="onViewModeChange('list')"
                  title="List View (มุมมองรายการยาว)"
                >
                  ☰
                </button>
              </div>
            </div>

            <!-- Reset Filters Button (When active) -->
            <div *ngIf="hasActiveFilters()" class="reset-wrapper">
              <label class="filter-label">&nbsp;</label>
              <button
                type="button"
                class="btn-reset-filters"
                (click)="onResetFilters()"
                title="ล้างค่าตัวกรองทั้งหมด"
              >
                <span>↺ ล้างตัวกรอง</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Results Bar -->
      <section class="results-header-section">
        <div class="results-meta">
          <span class="results-count">
            พบ <strong>{{ filteredCourses().length }}</strong> จาก {{ totalCoursesCount() }} หลักสูตร
          </span>

          <!-- Active Filter Badges -->
          <div *ngIf="hasActiveFilters()" class="active-filter-chips">
            <span *ngIf="selectedCategory() !== 'All'" class="active-chip">
              หมวดหมู่: {{ selectedCategory() }}
              <button (click)="onSelectCategory('All')">✕</button>
            </span>

            <span *ngIf="selectedLevel() !== 'All'" class="active-chip">
              ระดับ: {{ selectedLevel() }}
              <button (click)="onLevelChange('All')">✕</button>
            </span>

            <span *ngIf="selectedStatus() !== 'All'" class="active-chip">
              สถานะ: {{ selectedStatus() }}
              <button (click)="onStatusChange('All')">✕</button>
            </span>

            <span *ngIf="searchQuery()" class="active-chip">
              ค้นหา: "{{ searchQuery() }}"
              <button (click)="onClearSearch()">✕</button>
            </span>
          </div>
        </div>
      </section>

      <!-- 6. Courses Grid or List Container -->
      <section class="courses-container">
        <!-- Case: Has Results -->
        <div
          *ngIf="filteredCourses().length > 0; else emptyState"
          [ngClass]="viewMode() === 'grid' ? 'courses-grid' : 'courses-list'"
        >
          <app-course-card
            *ngFor="let course of filteredCourses(); trackBy: trackCourseById"
            [course]="course"
            [viewMode]="viewMode()"
            (enroll)="handleEnroll(course.id, course.title)"
            (resume)="handleResume(course.id, course.title)"
          ></app-course-card>
        </div>

        <!-- Case: Empty State (No Search Match) -->
        <ng-template #emptyState>
          <div class="empty-results-box">
            <div class="empty-icon">🔍</div>
            <h3 class="empty-title">ไม่พบหลักสูตรที่ตรงกับเงื่อนไขการค้นหา</h3>
            <p class="empty-sub">
              ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่มล้างตัวกรองเพื่อดูหลักสูตรทั้งหมด
            </p>
            <button type="button" class="btn-empty-reset" (click)="onResetFilters()">
              ↺ ล้างตัวกรองทั้งหมด
            </button>
          </div>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .catalog-page {
      max-width: 1720px;
      margin: 0 auto;
      padding: clamp(1.25rem, 2.5vw, 3rem) clamp(1rem, 2.5vw, 2.5rem);
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
      from {
        transform: translateY(-20px) scale(0.95);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
      }
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .toast-icon {
      font-size: 1.5rem;
    }

    .toast-text {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .toast-text strong {
      font-size: 0.88rem;
      color: #34d399;
    }

    .toast-text span {
      font-size: 0.82rem;
      color: #cbd5e1;
      line-height: 1.35;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.2rem 0.4rem;
      border-radius: 6px;
    }

    .toast-close:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    /* Hero Section */
    .hero-catalog {
      position: relative;
      border-radius: 24px;
      padding: clamp(2rem, 3.5vw, 3.5rem) clamp(1.5rem, 3vw, 3rem);
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.14) 0%, rgba(2, 132, 199, 0.08) 100%);
      border: 1px solid rgba(0, 168, 135, 0.25);
      margin-bottom: 2rem;
      overflow: hidden;
      box-sizing: border-box;
      width: 100%;
    }

    .hero-inner {
      position: relative;
      z-index: 2;
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
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.4px;
      margin-bottom: 1rem;
      white-space: nowrap;
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
      0% {
        box-shadow: 0 0 0 0 rgba(0, 168, 135, 0.7);
      }
      70% {
        box-shadow: 0 0 0 8px rgba(0, 168, 135, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(0, 168, 135, 0);
      }
    }

    .hero-title {
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      letter-spacing: -0.8px;
      margin: 0 0 0.75rem 0;
      line-height: 1.25;
    }

    .highlight {
      background: linear-gradient(120deg, #00a887, #0284c7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-sub {
      font-size: 1rem;
      color: var(--sic-color-text-muted, #475569);
      max-width: 780px;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .kpi-card {
      background: var(--sic-color-bg, #ffffff);
      padding: 1rem 1.25rem;
      border-radius: 16px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .kpi-icon {
      font-size: 1.8rem;
    }

    .kpi-detail {
      display: flex;
      flex-direction: column;
    }

    .kpi-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      line-height: 1.1;
    }

    .kpi-label {
      font-size: 0.76rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 600;
      margin-top: 0.2rem;
      white-space: nowrap;
    }

    .highlight-kpi {
      border-color: rgba(239, 68, 68, 0.35);
      background: rgba(239, 68, 68, 0.03);
    }
    .highlight-kpi .kpi-val {
      color: #ef4444;
    }

    /* Category Tabs */
    .category-tabs-section {
      margin-bottom: 1.5rem;
    }

    .category-tabs-wrapper {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      overflow-x: auto;
      padding: 0.5rem 0;
      scrollbar-width: thin;
    }

    .cat-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.1rem;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 999px;
      color: var(--sic-color-text, #334155);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .cat-tab-btn:hover {
      border-color: #00a887;
      color: #00a887;
      transform: translateY(-1px);
    }

    .cat-tab-btn.active {
      background: #00a887;
      color: #ffffff;
      border-color: #00a887;
      box-shadow: 0 4px 14px rgba(0, 168, 135, 0.35);
    }

    .tab-icon {
      font-size: 1rem;
    }

    .tab-count {
      font-size: 0.72rem;
      padding: 0.15rem 0.45rem;
      background: rgba(0, 0, 0, 0.06);
      border-radius: 999px;
      font-weight: 700;
    }

    .cat-tab-btn.active .tab-count {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    /* Toolbar Section */
    .toolbar-section {
      margin-bottom: 1.5rem;
    }

    .toolbar-card {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 1.25rem 1.5rem;
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-sizing: border-box;
      width: 100%;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 1.2rem;
      font-size: 1.1rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.85rem 3rem 0.85rem 3rem;
      background: var(--sic-color-surface, #f8fafc);
      border: 1.5px solid var(--sic-color-border, #e2e8f0);
      border-radius: 12px;
      font-size: 0.95rem;
      color: var(--sic-color-text-active, #0f172a);
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .search-input:focus {
      background: #ffffff;
      border-color: #00a887;
      box-shadow: 0 0 0 4px rgba(0, 168, 135, 0.15);
    }

    .search-clear-btn {
      position: absolute;
      right: 1rem;
      background: rgba(0, 0, 0, 0.05);
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .search-clear-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #0f172a;
    }

    .filters-actions-group {
      display: flex;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
      width: 100%;
    }

    .filter-select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
      min-width: 160px;
    }

    .filter-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .filter-select {
      padding: 0.65rem 1rem;
      background: var(--sic-color-surface, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 10px;
      font-size: 0.88rem;
      color: var(--sic-color-text-active, #0f172a);
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s ease;
      font-weight: 500;
    }

    .filter-select:focus {
      border-color: #00a887;
    }

    .view-switch-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .view-switch-btns {
      display: flex;
      background: var(--sic-color-surface, #f1f5f9);
      padding: 0.25rem;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .switch-btn {
      padding: 0.45rem 0.85rem;
      background: transparent;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .switch-btn.active {
      background: #ffffff;
      color: #00a887;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      font-weight: bold;
    }

    .reset-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .btn-reset-filters {
      padding: 0.65rem 1.1rem;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 10px;
      color: #ef4444;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-reset-filters:hover {
      background: rgba(239, 68, 68, 0.15);
      transform: translateY(-1px);
    }

    /* Results Header */
    .results-header-section {
      margin-bottom: 1.5rem;
    }

    .results-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .results-count {
      font-size: 0.95rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .results-count strong {
      color: var(--sic-color-text-active, #0f172a);
      font-size: 1.05rem;
    }

    .active-filter-chips {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .active-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.65rem;
      background: rgba(0, 168, 135, 0.12);
      border: 1px solid rgba(0, 168, 135, 0.25);
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 600;
      color: #007965;
    }

    .active-chip button {
      background: transparent;
      border: none;
      color: #007965;
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }

    /* Courses Layout Container */
    .courses-container {
      width: 100%;
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: clamp(1.25rem, 2vw, 2rem);
      width: 100%;
      box-sizing: border-box;
    }

    .courses-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;
      box-sizing: border-box;
    }

    /* Empty Results Box */
    .empty-results-box {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 20px;
      border: 1px dashed var(--sic-color-border, #cbd5e1);
      padding: 4rem 2rem;
      text-align: center;
      margin: 2rem 0;
    }

    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .empty-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.5rem 0;
    }

    .empty-sub {
      font-size: 0.92rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0 0 1.5rem 0;
    }

    .btn-empty-reset {
      padding: 0.75rem 1.5rem;
      background: #00a887;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-empty-reset:hover {
      background: #009688;
      box-shadow: 0 4px 14px rgba(0, 168, 135, 0.4);
    }
  `],
})
export class CoursesCatalogComponent {
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);

  readonly toastMessage = signal<string | null>(null);

  // Readonly states from service
  readonly filteredCourses = this.coursesService.filteredCourses;
  readonly totalCoursesCount = this.coursesService.totalCoursesCount;
  readonly enrolledCount = this.coursesService.enrolledCount;
  readonly mandatoryCount = this.coursesService.mandatoryCount;
  readonly totalXpSum = this.coursesService.totalXpSum;
  readonly categoryOptions = this.coursesService.categoryOptions;
  readonly selectedCategory = this.coursesService.selectedCategory;
  readonly selectedLevel = this.coursesService.selectedLevel;
  readonly selectedStatus = this.coursesService.selectedStatus;
  readonly sortBy = this.coursesService.sortBy;
  readonly viewMode = this.coursesService.viewMode;
  readonly searchQuery = this.coursesService.searchQuery;
  readonly hasActiveFilters = this.coursesService.hasActiveFilters;

  trackCourseById(index: number, course: { id: string }): string {
    return course.id;
  }

  onSelectCategory(category: CourseCategory | 'All'): void {
    this.coursesService.setCategory(category);
  }

  onSearchInput(query: string): void {
    this.coursesService.setSearchQuery(query);
  }

  onClearSearch(): void {
    this.coursesService.setSearchQuery('');
  }

  onLevelChange(level: CourseLevel | 'All'): void {
    this.coursesService.setLevel(level);
  }

  onStatusChange(status: EnrollmentStatus | 'All'): void {
    this.coursesService.setStatus(status);
  }

  onSortChange(sortBy: 'popular' | 'newest' | 'rating' | 'duration'): void {
    this.coursesService.setSortBy(sortBy);
  }

  onViewModeChange(mode: 'grid' | 'list'): void {
    this.coursesService.setViewMode(mode);
  }

  onResetFilters(): void {
    this.coursesService.resetFilters();
  }

  handleEnroll(courseId: string, courseTitle: string): void {
    const success = this.coursesService.enrollCourse(courseId);
    if (success) {
      this.showToast(`🎉 ลงทะเบียนหลักสูตร "${courseTitle}" สำเร็จแล้ว! พร้อมเริ่มเรียนได้ทันที`);
    }
  }

  handleResume(courseId: string, courseTitle: string): void {
    this.router.navigate(['/courses', courseId]);
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

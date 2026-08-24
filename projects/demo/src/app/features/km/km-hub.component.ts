import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KmService } from '../../core/services/km.service';
import { KmArticle, KmSpace, KmSpaceId } from '../../core/models/km.model';

@Component({
  selector: 'app-km-hub',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  template: `
    <div class="km-container">
      <!-- 🌟 KM HERO BANNER -->
      <header class="km-hero">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            <span>💡 Soft Inter Chiangrai Knowledge Base & Wiki</span>
          </div>
          <h1 class="hero-title">
            คลังความรู้และมาตรฐานองค์กร
            <span class="gradient-text">(KM Spaces)</span>
          </h1>
          <p class="hero-subtitle">
            ศูนย์กลางสถาปัตยกรรมซอฟต์แวร์, Best Practices, คู่มือการทำงาน และระเบียบปฏิบัติสำหรับทุกฝ่าย
          </p>

          <!-- 🔍 QUICK SEARCH BAR -->
          <div class="search-box-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              placeholder="ค้นหาเอกสาร, Guideline, คำสั่งโค้ด หรือระเบียบองค์กร..."
              [ngModel]="kmService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
            />
            @if (kmService.searchQuery()) {
              <button class="clear-search-btn" (click)="onSearchChange('')" title="ล้างการค้นหา">✕</button>
            }
          </div>

          <!-- 📊 KM KPI METRICS -->
          <div class="km-metrics-grid">
            <div class="metric-chip">
              <span class="metric-icon">📚</span>
              <div class="metric-info">
                <strong>{{ kmService.stats().totalArticles }}</strong>
                <span>บทความทั้งหมด</span>
              </div>
            </div>
            <div class="metric-chip">
              <span class="metric-icon">🏢</span>
              <div class="metric-info">
                <strong>{{ kmService.stats().totalSpaces }}</strong>
                <span>แผนก / Spaces</span>
              </div>
            </div>
            <div class="metric-chip">
              <span class="metric-icon">👁️</span>
              <div class="metric-info">
                <strong>{{ kmService.stats().totalViews | number }}</strong>
                <span>ยอดเข้าอ่านรวม</span>
              </div>
            </div>
            <div class="metric-chip">
              <span class="metric-icon">❤️</span>
              <div class="metric-info">
                <strong>{{ kmService.stats().totalLikes }}</strong>
                <span>คะแนนชื่นชอบ</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 🏢 DEPARTMENT SPACES SELECTOR -->
      <section class="spaces-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">🏢 แผนกและพื้นที่ความรู้ (Department Spaces)</h2>
            <p class="section-desc">เลือกแผนกเพื่อเข้าดูคู่มือและองค์ความรู้เฉพาะสายงาน</p>
          </div>
          <div class="header-actions">
            <button
              class="btn-bookmark-filter"
              [class.active]="viewMode() === 'bookmarks'"
              (click)="toggleBookmarkView()"
            >
              <span class="btn-icon">🔖</span>
              <span>บทความที่บันทึกไว้ ({{ kmService.stats().bookmarkedCount }})</span>
            </button>
            <button class="btn-create-article" (click)="openCreateModal()">
              <span class="btn-icon">✍️</span>
              <span>แชร์องค์ความรู้ใหม่</span>
            </button>
          </div>
        </div>

        <!-- Space Cards Grid -->
        <div class="spaces-grid">
          <!-- All Spaces Card -->
          <div
            class="space-card"
            [class.active]="kmService.selectedSpaceId() === 'all' && viewMode() === 'all'"
            (click)="selectSpace('all')"
          >
            <div class="space-icon-box" style="background: rgba(0, 168, 135, 0.12); color: #00a887;">
              🌐
            </div>
            <div class="space-body">
              <h3 class="space-title">คลังความรู้ทั้งหมด</h3>
              <p class="space-desc">รวมบทความและ Guideline จากทุกฝ่ายในองค์กร</p>
              <div class="space-footer">
                <span class="article-count-pill">{{ kmService.stats().totalArticles }} บทความ</span>
                <span class="view-indicator">สำรวจ →</span>
              </div>
            </div>
          </div>

          <!-- Department Spaces -->
          @for (space of kmService.spaces(); track space.id) {
            <div
              class="space-card"
              [class.active]="kmService.selectedSpaceId() === space.id && viewMode() === 'all'"
              (click)="selectSpace(space.id)"
            >
              <div class="space-icon-box" [style.background]="space.bgColor" [style.color]="space.color">
                {{ space.icon }}
              </div>
              <div class="space-body">
                <div class="space-lead-avatar-wrap">
                  <h3 class="space-title">{{ space.thaiName }}</h3>
                </div>
                <p class="space-desc">{{ space.description }}</p>
                <div class="space-footer">
                  <span class="article-count-pill" [style.color]="space.color">
                    {{ space.totalArticles }} บทความ
                  </span>
                  <div class="space-lead-mini">
                    <img [src]="space.leadAvatar" [alt]="space.leadName" class="lead-thumb" />
                    <span>{{ space.leadName }}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 🎯 ACTIVE SPACE HIGHLIGHT / BANNER -->
      @if (kmService.activeSpace(); as activeSpace) {
        <section class="active-space-banner" [style.border-left-color]="activeSpace.color">
          <div class="space-banner-info">
            <div class="space-badge-large" [style.background]="activeSpace.bgColor" [style.color]="activeSpace.color">
              {{ activeSpace.icon }} {{ activeSpace.thaiName }}
            </div>
            <p class="space-banner-desc">{{ activeSpace.description }}</p>
            <div class="space-tags-row">
              <span class="tags-label">🏷️ คีย์เวิร์ดยอดนิยม:</span>
              @for (tag of activeSpace.popularTags; track tag) {
                <span class="space-tag-chip" (click)="filterByTag(tag)">#{{ tag }}</span>
              }
            </div>
          </div>
          <div class="space-lead-card">
            <img [src]="activeSpace.leadAvatar" [alt]="activeSpace.leadName" class="lead-avatar-lg" />
            <div class="lead-meta">
              <span class="lead-badge">Space Lead</span>
              <strong class="lead-name">{{ activeSpace.leadName }}</strong>
              <span class="lead-role">{{ activeSpace.leadRole }}</span>
            </div>
          </div>
        </section>
      }

      <!-- 🏷️ CATEGORY FILTER BAR & TOOLBAR -->
      <section class="articles-toolbar">
        <div class="category-chips-scroll">
          @for (cat of kmService.availableCategories(); track cat) {
            <button
              class="cat-chip"
              [class.active]="kmService.selectedCategory() === cat"
              (click)="selectCategory(cat)"
            >
              {{ cat === 'All' ? '📑 ทั้งหมด' : getCategoryIcon(cat) + ' ' + cat }}
            </button>
          }
        </div>

        <div class="results-summary">
          <span>พบ <strong>{{ displayedArticles().length }}</strong> รายการ</span>
          @if (kmService.searchQuery()) {
            <span class="search-tag-indicator">
              คำค้น: "{{ kmService.searchQuery() }}"
              <button (click)="onSearchChange('')">✕</button>
            </span>
          }
        </div>
      </section>

      <!-- 📄 ARTICLES LIST / GRID -->
      @if (displayedArticles().length > 0) {
        <div class="articles-grid">
          @for (article of displayedArticles(); track article.id) {
            <article class="article-card" [class.pinned]="article.pinned">
              <!-- Card Header -->
              <div class="article-card-header">
                <div class="badge-group">
                  <span
                    class="space-pill"
                    [style.background]="getSpaceMeta(article.spaceId).bgColor"
                    [style.color]="getSpaceMeta(article.spaceId).color"
                  >
                    {{ getSpaceMeta(article.spaceId).icon }} {{ getSpaceMeta(article.spaceId).thaiName }}
                  </span>
                  <span class="category-pill">{{ article.category }}</span>
                  @if (article.pinned) {
                    <span class="pin-badge">📌 ปักหมุด</span>
                  }
                </div>
                <button
                  class="btn-bookmark"
                  [class.bookmarked]="kmService.isBookmarked(article.id)"
                  (click)="toggleBookmark($event, article.id)"
                  title="บันทึกไว้อ่านภายหลัง"
                >
                  {{ kmService.isBookmarked(article.id) ? '🔖' : '📑' }}
                </button>
              </div>

              <!-- Title & Summary -->
              <h3 class="article-title">
                <a [routerLink]="['/km', article.id]">{{ article.title }}</a>
              </h3>
              <p class="article-summary">{{ article.summary }}</p>

              <!-- Tags -->
              <div class="article-tags">
                @for (tag of article.tags; track tag) {
                  <span class="article-tag" (click)="filterByTag(tag)">#{{ tag }}</span>
                }
              </div>

              <!-- Footer Metadata -->
              <div class="article-card-footer">
                <div class="author-info">
                  <img [src]="article.author.avatarUrl" [alt]="article.author.name" class="author-avatar" />
                  <div class="author-text">
                    <span class="author-name">{{ article.author.name }}</span>
                    <span class="updated-time">อัปเดตเมื่อ {{ article.lastUpdated }}</span>
                  </div>
                </div>

                <div class="stats-and-action">
                  <div class="article-stats">
                    <span title="เวลาที่ใช้อ่าน">⏱️ {{ article.readTimeMinutes }} นาที</span>
                    <span title="จำนวนผู้อ่าน">👁️ {{ article.views }}</span>
                    <span
                      class="like-btn-mini"
                      [class.liked]="kmService.isLiked(article.id)"
                      (click)="toggleLike($event, article.id)"
                    >
                      {{ kmService.isLiked(article.id) ? '❤️' : '🤍' }} {{ article.likes }}
                    </span>
                  </div>
                  <a [routerLink]="['/km', article.id]" class="btn-read-article">
                    อ่านเนื้อหา →
                  </a>
                </div>
              </div>
            </article>
          }
        </div>
      } @else {
        <!-- Empty State -->
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>ไม่พบบทความที่ตรงกับเงื่อนไข</h3>
          <p>ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่และแผนกอื่น</p>
          <button class="btn-reset-filters" (click)="resetFilters()">
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      }

      <!-- 📝 CREATE NEW ARTICLE MODAL -->
      @if (showCreateModal()) {
        <div class="modal-backdrop" (click)="closeCreateModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="modal-icon">✍️</span>
                <div>
                  <h3 class="modal-title">แบ่งปันองค์ความรู้ใหม่ (Create Knowledge Wiki)</h3>
                  <p class="modal-subtitle">บันทึก Guideline, Best Practice หรือข้อกำหนดเพื่อเป็นประโยชน์ต่อทีม</p>
                </div>
              </div>
              <button class="btn-close-modal" (click)="closeCreateModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">หัวข้อบทความ / Knowledge Title <span class="req">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="เช่น มาตรฐานการเขียน Unit Test ด้วย Jasmine & Vitest"
                  [(ngModel)]="newArticleData.title"
                />
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">แผนก / Department Space <span class="req">*</span></label>
                  <select class="form-control select-control" [(ngModel)]="newArticleData.spaceId">
                    @for (space of kmService.spaces(); track space.id) {
                      <option [value]="space.id">{{ space.icon }} {{ space.thaiName }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">ประเภทบทความ / Category <span class="req">*</span></label>
                  <select class="form-control select-control" [(ngModel)]="newArticleData.category">
                    <option value="Guidelines">📘 Guidelines (แนวทางปฏิบัติ)</option>
                    <option value="Cheat Sheet">⚡ Cheat Sheet (สรุปคำสั่งด่วน)</option>
                    <option value="Architecture">🏛️ Architecture (สถาปัตยกรรมระบบ)</option>
                    <option value="Setup & Config">⚙️ Setup & Config (การติดตั้ง)</option>
                    <option value="Policy">📜 Policy (ระเบียบและนโยบาย)</option>
                    <option value="Troubleshooting">🔧 Troubleshooting (การแก้ปัญหา)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">คำอธิบายสังเขป / Summary <span class="req">*</span></label>
                <textarea
                  class="form-control textarea-control"
                  rows="2"
                  placeholder="สรุปสาระสำคัญของเอกสารนี้สั้นๆ 1-2 ประโยค"
                  [(ngModel)]="newArticleData.summary"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">เนื้อหาบทความ / Content (Markdown) <span class="req">*</span></label>
                <textarea
                  class="form-control textarea-control"
                  rows="6"
                  placeholder="เขียนรายละเอียดเนื้อหา, ขั้นตอนการปฏิบัติ หรือกฎเกณฑ์ต่างๆ..."
                  [(ngModel)]="newArticleData.content"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">คีย์เวิร์ด Tags (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="เช่น Angular, Testing, Best Practice"
                  [(ngModel)]="newArticleData.tagsInput"
                />
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeCreateModal()">ยกเลิก</button>
              <button
                class="btn-submit-publish"
                [disabled]="!newArticleData.title || !newArticleData.content || !newArticleData.summary"
                (click)="submitNewArticle()"
              >
                🚀 เผยแพร่องค์ความรู้
              </button>
            </div>
          </div>
        </div>
      }

      <!-- 🍞 TOAST NOTIFICATION -->
      @if (toastMessage()) {
        <div class="toast-popup">
          <span class="toast-icon">✨</span>
          <span>{{ toastMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .km-container {
      max-width: 1380px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 4rem;
    }

    /* 🌟 HERO BANNER */
    .km-hero {
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.08) 0%, rgba(15, 23, 42, 0.04) 100%);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 24px;
      padding: 2.75rem 2rem;
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
    }

    .hero-content {
      max-width: 820px;
      margin: 0 auto;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #00a887;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(0, 168, 135, 0.25);
    }

    .hero-title {
      font-size: 2.25rem;
      font-weight: 850;
      color: var(--sic-color-text-active, #0f172a);
      line-height: 1.25;
      margin: 0 0 0.75rem 0;
      letter-spacing: -0.02em;
    }

    .gradient-text {
      background: linear-gradient(135deg, #00a887 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0 auto 1.75rem;
      line-height: 1.6;
    }

    /* 🔍 SEARCH BOX */
    .search-box-wrapper {
      position: relative;
      max-width: 680px;
      margin: 0 auto 1.75rem;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1.25rem;
      font-size: 1.15rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.95rem 3rem 0.95rem 3.25rem;
      font-size: 1rem;
      font-family: inherit;
      border-radius: 999px;
      border: 2px solid var(--sic-color-border, #cbd5e1);
      background: var(--sic-color-bg, #ffffff);
      color: var(--sic-color-text-active, #0f172a);
      outline: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    }

    .search-input:focus {
      border-color: #00a887;
      box-shadow: 0 0 0 4px rgba(0, 168, 135, 0.15);
    }

    .clear-search-btn {
      position: absolute;
      right: 1.25rem;
      background: var(--sic-color-surface-hover, #e2e8f0);
      color: var(--sic-color-text-muted, #64748b);
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: bold;
    }

    /* 📊 KPI METRICS */
    .km-metrics-grid {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .metric-chip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 0.6rem 1.1rem;
      border-radius: 14px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .metric-icon {
      font-size: 1.35rem;
    }

    .metric-info {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .metric-info strong {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      line-height: 1.1;
    }

    .metric-info span {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    /* 🏢 SPACES SECTION */
    .spaces-section {
      margin-bottom: 2.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .section-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.25rem 0;
    }

    .section-desc {
      font-size: 0.9rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-bookmark-filter, .btn-create-article {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.1rem;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-bookmark-filter {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      color: var(--sic-color-text-active, #0f172a);
    }

    .btn-bookmark-filter:hover, .btn-bookmark-filter.active {
      border-color: #00a887;
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
    }

    .btn-create-article {
      background: #00a887;
      border: none;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.25);
    }

    .btn-create-article:hover {
      background: #008f73;
      transform: translateY(-1px);
    }

    /* 🏢 SPACES GRID */
    .spaces-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .space-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1.5px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      padding: 1.25rem;
      display: flex;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
    }

    .space-card:hover {
      border-color: #00a887;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    }

    .space-card.active {
      border-color: #00a887;
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.04) 0%, var(--sic-color-bg, #ffffff) 100%);
      box-shadow: 0 0 0 2px rgba(0, 168, 135, 0.35);
    }

    .space-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .space-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .space-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.35rem 0;
    }

    .space-desc {
      font-size: 0.82rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0 0 0.85rem 0;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .space-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      font-size: 0.8rem;
    }

    .article-count-pill {
      font-weight: 700;
      background: var(--sic-color-surface-hover, rgba(0, 0, 0, 0.04));
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }

    .space-lead-mini {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--sic-color-text-muted, #64748b);
      font-size: 0.78rem;
    }

    .lead-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
    }

    .view-indicator {
      color: #00a887;
      font-weight: 700;
    }

    /* 🎯 ACTIVE SPACE BANNER */
    .active-space-banner {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-left: 5px solid #00a887;
      border-radius: 18px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
    }

    .space-badge-large {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.15rem;
      font-weight: 800;
      padding: 0.4rem 1rem;
      border-radius: 10px;
      margin-bottom: 0.5rem;
    }

    .space-banner-desc {
      font-size: 0.95rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0 0 0.85rem 0;
      max-width: 750px;
    }

    .space-tags-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tags-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
    }

    .space-tag-chip {
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .space-tag-chip:hover {
      background: #00a887;
      color: #ffffff;
    }

    .space-lead-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: var(--sic-color-surface, rgba(0, 0, 0, 0.02));
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 0.85rem 1.15rem;
      border-radius: 14px;
      flex-shrink: 0;
    }

    .lead-avatar-lg {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #00a887;
    }

    .lead-meta {
      display: flex;
      flex-direction: column;
    }

    .lead-badge {
      font-size: 0.7rem;
      font-weight: 800;
      color: #00a887;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .lead-name {
      font-size: 0.92rem;
      color: var(--sic-color-text-active, #0f172a);
    }

    .lead-role {
      font-size: 0.78rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    /* 🏷️ CATEGORY FILTER BAR & TOOLBAR */
    .articles-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .category-chips-scroll {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .category-chips-scroll::-webkit-scrollbar {
      display: none;
    }

    .cat-chip {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      color: var(--sic-color-text-muted, #64748b);
      padding: 0.45rem 0.95rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .cat-chip:hover {
      border-color: #00a887;
      color: #00a887;
    }

    .cat-chip.active {
      background: #00a887;
      border-color: #00a887;
      color: #ffffff;
    }

    .results-summary {
      font-size: 0.88rem;
      color: var(--sic-color-text-muted, #64748b);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .results-summary strong {
      color: var(--sic-color-text-active, #0f172a);
    }

    .search-tag-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(0, 168, 135, 0.1);
      color: #00a887;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .search-tag-indicator button {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-weight: bold;
    }

    /* 📄 ARTICLES GRID */
    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .article-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
      position: relative;
    }

    .article-card:hover {
      border-color: #00a887;
      transform: translateY(-3px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
    }

    .article-card.pinned {
      border-top: 3px solid #00a887;
    }

    .article-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
    }

    .badge-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .space-pill {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .category-pill {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      background: var(--sic-color-surface-hover, rgba(0, 0, 0, 0.04));
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .pin-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: #d97706;
      background: rgba(217, 119, 6, 0.12);
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .btn-bookmark {
      background: none;
      border: none;
      font-size: 1.15rem;
      cursor: pointer;
      padding: 0.2rem;
      border-radius: 6px;
      transition: transform 0.15s ease;
    }

    .btn-bookmark:hover {
      transform: scale(1.2);
    }

    .article-title {
      font-size: 1.12rem;
      font-weight: 800;
      line-height: 1.4;
      margin: 0 0 0.65rem 0;
    }

    .article-title a {
      color: var(--sic-color-text-active, #0f172a);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .article-title a:hover {
      color: #00a887;
    }

    .article-summary {
      font-size: 0.88rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.55;
      margin: 0 0 1rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }

    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 1.25rem;
    }

    .article-tag {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
      background: var(--sic-color-surface, rgba(0, 0, 0, 0.03));
      border: 1px solid var(--sic-color-border, transparent);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .article-tag:hover {
      color: #00a887;
      background: rgba(0, 168, 135, 0.1);
    }

    .article-card-footer {
      border-top: 1px solid var(--sic-color-border, #f1f5f9);
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .author-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-text {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
    }

    .updated-time {
      font-size: 0.72rem;
      color: var(--sic-color-text-muted, #94a3b8);
    }

    .stats-and-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .article-stats {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.78rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .like-btn-mini {
      cursor: pointer;
      user-select: none;
      transition: transform 0.15s ease;
    }

    .like-btn-mini:hover {
      transform: scale(1.15);
    }

    .btn-read-article {
      display: inline-flex;
      align-items: center;
      color: #00a887;
      font-size: 0.85rem;
      font-weight: 800;
      text-decoration: none;
      transition: transform 0.15s ease;
    }

    .btn-read-article:hover {
      transform: translateX(3px);
    }

    /* 🔍 EMPTY STATE */
    .empty-state {
      text-align: center;
      padding: 4rem 1.5rem;
      background: var(--sic-color-bg, #ffffff);
      border: 1px dashed var(--sic-color-border, #cbd5e1);
      border-radius: 20px;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      font-size: 0.95rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0 0 1.5rem 0;
    }

    .btn-reset-filters {
      background: #00a887;
      border: none;
      color: #ffffff;
      padding: 0.65rem 1.35rem;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }

    /* 📝 CREATE MODAL */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }

    .modal-dialog {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 24px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      overflow: hidden;
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalPop {
      0% { opacity: 0; transform: scale(0.95) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title-group {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .modal-icon {
      font-size: 1.8rem;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.82rem;
      color: var(--sic-color-text-muted, #64748b);
      margin: 0;
    }

    .btn-close-modal {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close-modal:hover {
      background: var(--sic-color-surface-hover, #f1f5f9);
      color: var(--sic-color-text-active, #0f172a);
    }

    .modal-body {
      padding: 1.5rem 1.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
    }

    .req {
      color: #ef4444;
    }

    .form-control {
      padding: 0.65rem 0.95rem;
      border-radius: 10px;
      border: 1.5px solid var(--sic-color-border, #cbd5e1);
      background: var(--sic-color-bg, #ffffff);
      color: var(--sic-color-text-active, #0f172a);
      font-family: inherit;
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .form-control:focus {
      border-color: #00a887;
    }

    .textarea-control {
      resize: vertical;
    }

    .select-control {
      cursor: pointer;
    }

    .modal-footer {
      padding: 1.25rem 1.75rem;
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-cancel {
      background: var(--sic-color-surface, #f1f5f9);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      cursor: pointer;
    }

    .btn-submit-publish {
      background: #00a887;
      border: none;
      color: #ffffff;
      padding: 0.65rem 1.5rem;
      border-radius: 10px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.25);
    }

    .btn-submit-publish:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* 🍞 TOAST */
    .toast-popup {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #0f172a;
      color: #ffffff;
      padding: 0.85rem 1.35rem;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.92rem;
      font-weight: 700;
      z-index: 10000;
      animation: toastSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes toastSlide {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    /* 📱 RESPONSIVE DESIGN */
    @media (max-width: 900px) {
      .active-space-banner {
        flex-direction: column;
        align-items: flex-start;
      }
      .space-lead-card {
        width: 100%;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .km-hero {
        padding: 2rem 1.25rem;
      }
      .hero-title {
        font-size: 1.65rem;
      }
      .search-input {
        padding-left: 2.75rem;
        font-size: 0.9rem;
      }
      .articles-grid {
        grid-template-columns: 1fr;
      }
      .header-actions {
        width: 100%;
      }
      .btn-bookmark-filter, .btn-create-article {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class KmHubComponent {
  readonly kmService = inject(KmService);

  readonly viewMode = signal<'all' | 'bookmarks'>('all');
  readonly showCreateModal = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // New Article Form State
  newArticleData = {
    title: '',
    spaceId: 'dev' as KmSpaceId,
    category: 'Guidelines' as any,
    summary: '',
    content: '',
    tagsInput: '',
  };

  readonly displayedArticles = computed(() => {
    if (this.viewMode() === 'bookmarks') {
      return this.kmService.bookmarkedArticles();
    }
    return this.kmService.filteredArticles();
  });

  onSearchChange(val: string) {
    this.kmService.setSearch(val);
  }

  selectSpace(spaceId: 'all' | KmSpaceId) {
    this.viewMode.set('all');
    this.kmService.setSpace(spaceId);
  }

  selectCategory(category: string) {
    this.kmService.setCategory(category);
  }

  filterByTag(tag: string) {
    this.kmService.setSearch(tag);
  }

  toggleBookmarkView() {
    this.viewMode.update((mode) => (mode === 'bookmarks' ? 'all' : 'bookmarks'));
  }

  toggleBookmark(event: Event, articleId: string) {
    event.stopPropagation();
    this.kmService.toggleBookmark(articleId);
    const isSaved = this.kmService.isBookmarked(articleId);
    this.showToast(isSaved ? '🔖 บันทึกบทความลงในรายการโปรดแล้ว' : 'ลบบทความออกจากรายการโปรดแล้ว');
  }

  toggleLike(event: Event, articleId: string) {
    event.stopPropagation();
    this.kmService.toggleLike(articleId);
  }

  resetFilters() {
    this.kmService.setSpace('all');
    this.kmService.setCategory('All');
    this.kmService.setSearch('');
    this.viewMode.set('all');
  }

  getSpaceMeta(spaceId: KmSpaceId): KmSpace {
    const s = this.kmService.spaces().find((sp) => sp.id === spaceId);
    return s || this.kmService.spaces()[0];
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Guidelines': return '📘';
      case 'Cheat Sheet': return '⚡';
      case 'Architecture': return '🏛️';
      case 'Setup & Config': return '⚙️';
      case 'Policy': return '📜';
      case 'Troubleshooting': return '🔧';
      default: return '📄';
    }
  }

  openCreateModal() {
    this.newArticleData = {
      title: '',
      spaceId: 'dev',
      category: 'Guidelines',
      summary: '',
      content: '',
      tagsInput: '',
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  submitNewArticle() {
    if (!this.newArticleData.title || !this.newArticleData.summary || !this.newArticleData.content) {
      return;
    }

    const tags = this.newArticleData.tagsInput
      ? this.newArticleData.tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : ['General'];

    const article = this.kmService.createArticle({
      slug: this.newArticleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: this.newArticleData.title,
      spaceId: this.newArticleData.spaceId,
      category: this.newArticleData.category,
      summary: this.newArticleData.summary,
      readTimeMinutes: Math.max(3, Math.ceil(this.newArticleData.content.length / 300)),
      lastUpdated: new Date().toISOString().split('T')[0],
      pinned: false,
      author: {
        name: 'อิงครัต ศรีทอง',
        role: 'Frontend Developer',
        department: 'Software Engineering',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      tags,
      sections: [
        {
          id: 'sec-main',
          title: '1. รายละเอียดเนื้อหา',
          contentMarkdown: this.newArticleData.content,
        },
      ],
      versionHistory: [],
    });

    this.closeCreateModal();
    this.showToast('🚀 เผยแพร่องค์ความรู้ใหม่สำเร็จ!');
  }

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}

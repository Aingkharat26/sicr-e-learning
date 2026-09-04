import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KmService } from '../../core/services/km.service';
import { KmArticle, KmSpace, KmSpaceId } from '../../core/models/km.model';
import {
  SicCodeComponent,
  SicTimelineComponent,
  SicTimelineItem,
} from 'sic-ng';

@Component({
  selector: 'app-km-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SicCodeComponent,
    SicTimelineComponent,
  ],
  template: `
    @if (article(); as art) {
      <div class="article-detail-container">
        <!-- 🧭 BREADCRUMB NAVIGATION -->
        <nav class="breadcrumb-nav">
          <a routerLink="/km" class="bc-link">💡 คลังความรู้ KM</a>
          <span class="bc-sep">›</span>
          <a
            routerLink="/km"
            [queryParams]="{ space: art.spaceId }"
            class="bc-link"
            [style.color]="spaceMeta()?.color"
          >
            {{ spaceMeta()?.icon }} {{ spaceMeta()?.thaiName }}
          </a>
          <span class="bc-sep">›</span>
          <span class="bc-current">{{ art.title }}</span>
        </nav>

        <!-- 📄 ARTICLE HEADER HERO -->
        <header class="article-hero">
          <div class="hero-badges">
            <span
              class="space-badge"
              [style.background]="spaceMeta()?.bgColor"
              [style.color]="spaceMeta()?.color"
            >
              {{ spaceMeta()?.icon }} {{ spaceMeta()?.thaiName }}
            </span>
            <span class="category-badge">{{ art.category }}</span>
            @if (art.pinned) {
              <span class="pin-badge">📌 ปักหมุด</span>
            }
          </div>

          <h1 class="article-main-title">{{ art.title }}</h1>
          <p class="article-lead-summary">{{ art.summary }}</p>

          <!-- Metadata & Action Toolbar -->
          <div class="article-meta-toolbar">
            <div class="author-meta-box">
              <img [src]="art.author.avatarUrl" [alt]="art.author.name" class="author-avatar-lg" />
              <div class="author-info">
                <strong class="author-name">{{ art.author.name }}</strong>
                <span class="author-role">{{ art.author.role }} • {{ art.author.department }}</span>
              </div>
            </div>

            <div class="article-metrics">
              <div class="metric-item">
                <span class="metric-lbl">📅 อัปเดตล่าสุด</span>
                <strong class="metric-val">{{ art.lastUpdated }}</strong>
              </div>
              <div class="metric-item">
                <span class="metric-lbl">⏱️ เวลาอ่าน</span>
                <strong class="metric-val">{{ art.readTimeMinutes }} นาที</strong>
              </div>
              <div class="metric-item">
                <span class="metric-lbl">👁️ ผู้เข้าชม</span>
                <strong class="metric-val">{{ art.views | number }} ครั้ง</strong>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons-group">
              <button
                class="btn-action-round"
                [class.active]="kmService.isLiked(art.id)"
                (click)="toggleLike(art.id)"
                title="กดถูกใจ"
              >
                <span>{{ kmService.isLiked(art.id) ? '❤️' : '🤍' }}</span>
                <span>{{ art.likes }}</span>
              </button>

              <button
                class="btn-action-round"
                [class.active]="kmService.isBookmarked(art.id)"
                (click)="toggleBookmark(art.id)"
                title="บันทึกบทความ"
              >
                <span>{{ kmService.isBookmarked(art.id) ? '🔖' : '📑' }}</span>
                <span>บันทึก</span>
              </button>

              <button class="btn-action-round" (click)="copyArticleLink()" title="คัดลอกลิงก์">
                <span>🔗</span>
                <span>แชร์</span>
              </button>

              <button class="btn-action-round" (click)="printArticle()" title="พิมพ์เอกสาร">
                <span>🖨️</span>
                <span>พิมพ์</span>
              </button>
            </div>
          </div>
        </header>

        <!-- 📖 MAIN CONTENT & SIDEBAR LAYOUT -->
        <div class="content-layout">
          <!-- LEFT / MAIN ARTICLE CONTENT -->
          <main class="article-content-body">
            <!-- Article Sections -->
            @for (section of art.sections; track section.id) {
              <section [id]="section.id" class="content-section">
                <h2 class="section-heading">{{ section.title }}</h2>

                <!-- Formatted text / Markdown -->
                <div class="markdown-paragraph">
                  <p>{{ section.contentMarkdown }}</p>
                </div>

                <!-- Callout Alert Box -->
                @if (section.callout) {
                  <div class="callout-box" [class]="'callout-' + section.callout.type">
                    <div class="callout-header">
                      <span class="callout-icon">
                        @switch (section.callout.type) {
                          @case ('important') { 🚨 }
                          @case ('warning') { ⚠️ }
                          @case ('tip') { 💡 }
                          @default { ℹ️ }
                        }
                      </span>
                      @if (section.callout.title) {
                        <strong class="callout-title">{{ section.callout.title }}</strong>
                      }
                    </div>
                    <p class="callout-text">{{ section.callout.text }}</p>
                  </div>
                }

                <!-- Code Snippet -->
                @if (section.codeSnippet) {
                  <div class="code-snippet-wrap">
                    @if (section.codeSnippet.filename) {
                      <div class="code-header">
                        <span class="code-lang-tag">{{ section.codeSnippet.language }}</span>
                        <span class="code-filename">📄 {{ section.codeSnippet.filename }}</span>
                      </div>
                    }
                    <sic-code
                      [code]="section.codeSnippet.code"
                      [language]="section.codeSnippet.language"
                      [showLineNumbers]="true"
                      [showCopyButton]="true"
                    ></sic-code>
                  </div>
                }
              </section>
            }

            <!-- 📎 ATTACHMENTS & RESOURCES -->
            @if (art.attachments && art.attachments.length > 0) {
              <section id="attachments-section" class="content-section attachments-card">
                <h3 class="section-subheading">📎 เอกสารแนบและไฟล์ประกอบ (Downloads)</h3>
                <div class="attachments-list">
                  @for (att of art.attachments; track att.name) {
                    <div class="attachment-item">
                      <div class="att-icon-box">
                        @switch (att.type) {
                          @case ('PDF') { 📕 }
                          @case ('Excel') { 📊 }
                          @case ('PowerPoint') { 📽️ }
                          @case ('Word') { 📝 }
                          @default { 📄 }
                        }
                      </div>
                      <div class="att-info">
                        <strong class="att-name">{{ att.name }}</strong>
                        <span class="att-meta">{{ att.type }} • {{ att.size }}</span>
                      </div>
                      <button class="btn-download-att" (click)="downloadAttachment(att.name)">
                        📥 ดาวน์โหลด
                      </button>
                    </div>
                  }
                </div>
              </section>
            }

            <!-- 🕒 VERSION HISTORY / CHANGELOG (TIMELINE) -->
            @if (art.versionHistory && art.versionHistory.length > 0) {
              <section id="changelog-section" class="content-section history-section">
                <h3 class="section-subheading">🕒 ประวัติการแก้ไขเอกสาร (Version History & Audit)</h3>
                <div class="timeline-wrapper">
                  <sic-timeline [items]="timelineItems()" [alternate]="false">
                    <ng-template #itemTemplate let-item>
                      <div class="timeline-custom-card">
                        <div class="timeline-card-header">
                          <span class="version-tag">{{ item.title }}</span>
                          <span class="version-date">{{ item.date }}</span>
                        </div>
                        <p class="version-note">{{ item.description }}</p>
                      </div>
                    </ng-template>
                  </sic-timeline>
                </div>
              </section>
            }

            <!-- 👍 WAS THIS HELPFUL FEEDBACK -->
            <section class="feedback-box">
              @if (!feedbackSubmitted()) {
                <span class="feedback-title">บทความนี้มีประโยชน์ต่อการทำงานของคุณหรือไม่?</span>
                <div class="feedback-actions">
                  <button class="btn-feedback" (click)="submitFeedback(true)">
                    <span>👍 ใช่ มีประโยชน์มาก</span>
                  </button>
                  <button class="btn-feedback" (click)="submitFeedback(false)">
                    <span>👎 ต้องการข้อมูลเพิ่มเติม</span>
                  </button>
                </div>
              } @else {
                <div class="feedback-thankyou">
                  <span>🎉 ขอบคุณสำหรับข้อเสนอแนะ! เราจะนำไปพัฒนาปรับปรุงคลังความรู้ให้ดียิ่งขึ้น</span>
                </div>
              }
            </section>

            <!-- 🔗 RELATED ARTICLES -->
            @if (relatedArticles().length > 0) {
              <section class="related-articles-section">
                <h3 class="section-subheading">📚 บทความที่เกี่ยวข้อง (Related Guidelines)</h3>
                <div class="related-grid">
                  @for (rel of relatedArticles(); track rel.id) {
                    <a [routerLink]="['/km', rel.id]" class="related-card">
                      <span class="related-category">{{ rel.category }}</span>
                      <h4 class="related-title">{{ rel.title }}</h4>
                      <div class="related-footer">
                        <span>⏱️ {{ rel.readTimeMinutes }} นาที</span>
                        <span>👁️ {{ rel.views }}</span>
                      </div>
                    </a>
                  }
                </div>
              </section>
            }
          </main>

          <!-- RIGHT SIDEBAR (TOC & AUTHOR/SPACE INFO) -->
          <aside class="article-sidebar">
            <!-- Table of Contents -->
            <div class="sidebar-card toc-card">
              <h4 class="sidebar-card-title">📑 สารบัญเนื้อหา (Contents)</h4>
              <ul class="toc-list">
                @for (sec of art.sections; track sec.id) {
                  <li>
                    <a [href]="'#' + sec.id" class="toc-link">{{ sec.title }}</a>
                  </li>
                }
                @if (art.attachments && art.attachments.length > 0) {
                  <li>
                    <a href="#attachments-section" class="toc-link">📎 เอกสารแนบและไฟล์ประกอบ</a>
                  </li>
                }
                @if (art.versionHistory && art.versionHistory.length > 0) {
                  <li>
                    <a href="#changelog-section" class="toc-link">🕒 ประวัติการแก้ไขเอกสาร</a>
                  </li>
                }
              </ul>
            </div>

            <!-- Space Lead / Department Info Card -->
            @if (spaceMeta(); as sp) {
              <div class="sidebar-card space-info-card">
                <h4 class="sidebar-card-title">🏢 แผนกเจ้าของเอกสาร</h4>
                <div class="space-lead-profile">
                  <img [src]="sp.leadAvatar" [alt]="sp.leadName" class="lead-thumb-sidebar" />
                  <div>
                    <strong class="lead-name-sidebar">{{ sp.leadName }}</strong>
                    <span class="lead-role-sidebar">{{ sp.leadRole }} (Space Lead)</span>
                  </div>
                </div>
                <p class="space-mini-desc">{{ sp.description }}</p>
                <a
                  routerLink="/km"
                  [queryParams]="{ space: sp.id }"
                  class="btn-view-all-space"
                  [style.color]="sp.color"
                >
                  ดูเอกสารทั้งหมดของ {{ sp.name }} →
                </a>
              </div>
            }

            <!-- Tags Cloud -->
            <div class="sidebar-card tags-card">
              <h4 class="sidebar-card-title">🏷️ แท็กที่เกี่ยวข้อง</h4>
              <div class="sidebar-tags-cloud">
                @for (t of art.tags; track t) {
                  <span class="sidebar-tag">#{{ t }}</span>
                }
              </div>
            </div>
          </aside>
        </div>

        <!-- 🍞 TOAST NOTIFICATION -->
        @if (toastMessage()) {
          <div class="toast-popup">
            <span class="toast-icon">✨</span>
            <span>{{ toastMessage() }}</span>
          </div>
        }
      </div>
    } @else {
      <!-- Not Found State -->
      <div class="not-found-container">
        <div class="not-found-card">
          <span class="not-found-icon">❓</span>
          <h2>ไม่พบเอกสารบทความที่ค้นหา</h2>
          <p>บทความนี้อาจถูกย้าย หรือคุณระบุรหัสเอกสารไม่ถูกต้อง</p>
          <a routerLink="/km" class="btn-back-home">← กลับสู่คลังความรู้ KM</a>
        </div>
      </div>
    }
  `,
  styles: [`
    .article-detail-container {
      max-width: 1380px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 5rem;
    }

    /* 🧭 BREADCRUMB */
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .bc-link {
      color: var(--sic-color-text-muted, #64748b);
      text-decoration: none;
      font-weight: 700;
      transition: color 0.15s ease;
    }

    .bc-link:hover {
      color: #00a887;
    }

    .bc-sep {
      color: #cbd5e1;
    }

    .bc-current {
      color: var(--sic-color-text-active, #0f172a);
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 450px;
    }

    /* 📄 ARTICLE HERO */
    .article-hero {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 24px;
      padding: 2.25rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
    }

    .hero-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .space-badge {
      font-size: 0.78rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 8px;
    }

    .category-badge {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      background: rgba(0, 0, 0, 0.04);
      padding: 0.25rem 0.65rem;
      border-radius: 8px;
    }

    .pin-badge {
      font-size: 0.78rem;
      font-weight: 700;
      color: #d97706;
      background: rgba(217, 119, 6, 0.12);
      padding: 0.25rem 0.65rem;
      border-radius: 8px;
    }

    .article-main-title {
      font-size: 2.2rem;
      font-weight: 850;
      color: var(--sic-color-text-active, #0f172a);
      line-height: 1.3;
      margin: 0 0 1rem 0;
      letter-spacing: -0.02em;
    }

    .article-lead-summary {
      font-size: 1.05rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.65;
      margin: 0 0 1.75rem 0;
      max-width: 950px;
    }

    .article-meta-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--sic-color-border, #f1f5f9);
    }

    .author-meta-box {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .author-avatar-lg {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #00a887;
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-size: 0.95rem;
      color: var(--sic-color-text-active, #0f172a);
    }

    .author-role {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .article-metrics {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
    }

    .metric-lbl {
      font-size: 0.72rem;
      color: var(--sic-color-text-muted, #94a3b8);
    }

    .metric-val {
      font-size: 0.88rem;
      color: var(--sic-color-text-active, #0f172a);
    }

    .action-buttons-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-action-round {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      color: var(--sic-color-text-active, #0f172a);
      padding: 0.45rem 0.85rem;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-action-round:hover, .btn-action-round.active {
      border-color: #00a887;
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
    }

    /* 📖 CONTENT & SIDEBAR LAYOUT */
    .content-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2rem;
      align-items: start;
    }

    .article-content-body {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 24px;
      padding: 2.5rem 2.25rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
    }

    .content-section {
      margin-bottom: 2.75rem;
    }

    .section-heading {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid rgba(0, 168, 135, 0.2);
    }

    .section-subheading {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 1.25rem 0;
    }

    .markdown-paragraph {
      font-size: 1rem;
      line-height: 1.75;
      color: var(--sic-color-text-active, #1e293b);
      margin-bottom: 1.25rem;
    }

    .markdown-paragraph p {
      margin: 0 0 1rem 0;
      white-space: pre-line;
    }

    /* 🚨 CALLOUT BOXES */
    .callout-box {
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      margin: 1.5rem 0;
      border-left: 5px solid;
    }

    .callout-important {
      background: rgba(239, 68, 68, 0.08);
      border-left-color: #ef4444;
    }

    .callout-warning {
      background: rgba(245, 158, 11, 0.08);
      border-left-color: #f59e0b;
    }

    .callout-tip {
      background: rgba(16, 185, 129, 0.08);
      border-left-color: #10b981;
    }

    .callout-note {
      background: rgba(59, 130, 246, 0.08);
      border-left-color: #3b82f6;
    }

    .callout-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .callout-icon {
      font-size: 1.2rem;
    }

    .callout-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
    }

    .callout-text {
      font-size: 0.92rem;
      color: var(--sic-color-text-active, #334155);
      margin: 0;
      line-height: 1.55;
    }

    /* 💻 CODE SNIPPETS */
    .code-snippet-wrap {
      margin: 1.5rem 0;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      padding: 0.5rem 1rem;
      color: #94a3b8;
      font-size: 0.78rem;
      font-family: monospace;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .code-lang-tag {
      text-transform: uppercase;
      color: #00a887;
      font-weight: bold;
    }

    /* 📎 ATTACHMENTS */
    .attachments-card {
      background: rgba(0, 0, 0, 0.02);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      padding: 1.5rem;
    }

    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 0.85rem 1.15rem;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .attachment-item:hover {
      border-color: #00a887;
      transform: translateY(-1px);
    }

    .att-icon-box {
      font-size: 1.5rem;
    }

    .att-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .att-name {
      font-size: 0.92rem;
      color: var(--sic-color-text-active, #0f172a);
    }

    .att-meta {
      font-size: 0.78rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .btn-download-att {
      background: rgba(0, 168, 135, 0.1);
      color: #00a887;
      border: none;
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-download-att:hover {
      background: #00a887;
      color: #ffffff;
    }

    /* 🕒 TIMELINE */
    .history-section {
      background: rgba(0, 0, 0, 0.015);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      padding: 1.5rem;
    }

    .timeline-custom-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 12px;
      padding: 0.85rem 1.15rem;
      margin-bottom: 0.5rem;
    }

    .timeline-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .version-tag {
      font-size: 0.8rem;
      font-weight: 800;
      color: #00a887;
      background: rgba(0, 168, 135, 0.1);
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }

    .version-date {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #94a3b8);
    }

    .version-note {
      font-size: 0.85rem;
      color: var(--sic-color-text-active, #334155);
      margin: 0;
    }

    /* 👍 FEEDBACK */
    .feedback-box {
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.06) 0%, rgba(59, 130, 246, 0.04) 100%);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      padding: 1.5rem;
      text-align: center;
      margin: 2.5rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .feedback-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
    }

    .feedback-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-feedback {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      color: var(--sic-color-text-active, #0f172a);
      padding: 0.6rem 1.25rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-feedback:hover {
      border-color: #00a887;
      background: rgba(0, 168, 135, 0.1);
      color: #00a887;
    }

    .feedback-thankyou {
      font-size: 0.95rem;
      font-weight: 700;
      color: #00a887;
    }

    /* 🔗 RELATED ARTICLES */
    .related-articles-section {
      margin-top: 2rem;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }

    .related-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 1.15rem;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }

    .related-card:hover {
      border-color: #00a887;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
    }

    .related-category {
      font-size: 0.72rem;
      font-weight: 700;
      color: #00a887;
      margin-bottom: 0.35rem;
    }

    .related-title {
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      line-height: 1.4;
      margin: 0 0 0.75rem 0;
      flex-grow: 1;
    }

    .related-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #94a3b8);
    }

    /* 📑 SIDEBAR */
    .article-sidebar {
      position: sticky;
      top: 5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .sidebar-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 18px;
      padding: 1.35rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
    }

    .sidebar-card-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
      margin: 0 0 1rem 0;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .toc-link {
      font-size: 0.85rem;
      color: var(--sic-color-text-muted, #64748b);
      text-decoration: none;
      line-height: 1.4;
      transition: color 0.15s ease;
      display: block;
    }

    .toc-link:hover {
      color: #00a887;
      font-weight: 700;
    }

    .space-lead-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .lead-thumb-sidebar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #00a887;
    }

    .lead-name-sidebar {
      font-size: 0.88rem;
      display: block;
      color: var(--sic-color-text-active, #0f172a);
    }

    .lead-role-sidebar {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .space-mini-desc {
      font-size: 0.8rem;
      color: var(--sic-color-text-muted, #64748b);
      line-height: 1.45;
      margin: 0 0 0.85rem 0;
    }

    .btn-view-all-space {
      font-size: 0.82rem;
      font-weight: 800;
      text-decoration: none;
      display: inline-block;
    }

    .sidebar-tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .sidebar-tag {
      font-size: 0.78rem;
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-weight: 700;
    }

    /* ❓ NOT FOUND */
    .not-found-container {
      max-width: 600px;
      margin: 4rem auto;
      text-align: center;
    }

    .not-found-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      padding: 3rem 2rem;
    }

    .not-found-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      display: block;
    }

    .btn-back-home {
      display: inline-block;
      margin-top: 1.5rem;
      background: #00a887;
      color: #ffffff;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 800;
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
    @media (max-width: 1080px) {
      .content-layout {
        grid-template-columns: 1fr;
      }
      .article-sidebar {
        position: static;
      }
    }

    @media (max-width: 640px) {
      .article-hero {
        padding: 1.5rem 1.25rem;
      }
      .article-main-title {
        font-size: 1.6rem;
      }
      .article-content-body {
        padding: 1.5rem 1.25rem;
      }
      .article-meta-toolbar {
        flex-direction: column;
        align-items: flex-start;
      }
      .action-buttons-group {
        width: 100%;
      }
      .btn-action-round {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class KmArticleDetailComponent implements OnInit {
  readonly id = input.required<string>();
  readonly kmService = inject(KmService);

  readonly toastMessage = signal<string | null>(null);
  readonly feedbackSubmitted = signal<boolean>(false);

  readonly article = computed<KmArticle | undefined>(() => {
    const articleId = this.id();
    return this.kmService.getArticleById(articleId);
  });

  readonly spaceMeta = computed<KmSpace | undefined>(() => {
    const art = this.article();
    if (!art) return undefined;
    return this.kmService.spaces().find((s) => s.id === art.spaceId);
  });

  readonly relatedArticles = computed<KmArticle[]>(() => {
    const art = this.article();
    if (!art) return [];
    return this.kmService.getRelatedArticles(art.id);
  });

  readonly timelineItems = computed<SicTimelineItem[]>(() => {
    const art = this.article();
    if (!art || !art.versionHistory) return [];
    return art.versionHistory.map((vh) => ({
      title: vh.version,
      date: vh.date,
      description: `${vh.changeNote} (โดย ${vh.author})`,
    }));
  });

  ngOnInit() {
    const art = this.article();
    if (art) {
      this.kmService.incrementView(art.id);
    }
  }

  toggleLike(articleId: string) {
    this.kmService.toggleLike(articleId);
  }

  toggleBookmark(articleId: string) {
    this.kmService.toggleBookmark(articleId);
    const isSaved = this.kmService.isBookmarked(articleId);
    this.showToast(isSaved ? '🔖 บันทึกบทความลงในรายการโปรดแล้ว' : 'ลบบทความออกจากรายการโปรดแล้ว');
  }

  copyArticleLink() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      this.showToast('🔗 คัดลอกลิงก์บทความไปยังคลิปบอร์ดแล้ว!');
    }
  }

  printArticle() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  downloadAttachment(filename: string) {
    this.showToast(`📥 กำลังดาวน์โหลดไฟล์ ${filename}...`);
  }

  submitFeedback(helpful: boolean) {
    this.feedbackSubmitted.set(true);
  }

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}

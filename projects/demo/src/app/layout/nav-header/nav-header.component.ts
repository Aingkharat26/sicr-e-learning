import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SicThemeService } from 'sic-ng';
import { AuthStateService } from '../../core/services/auth-state.service';
import { UserRole } from '../../core/models/user.model';
import { UserGuideService } from '../../core/services/user-guide.service';
import { AiAssistantService } from '../../core/services/ai-assistant.service';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sicr-header">
      <div class="header-container">
        <!-- 1. Brand Logo & Name -->
        <div class="brand-section">
          <a routerLink="/" class="brand-link" (click)="closeAllMenus()">
            <div class="brand-icon">
              <span class="icon-text">SIC</span>
            </div>
            <div class="brand-text">
              <div class="title-row">
                <span class="brand-title">SICR E-LEARNING</span>
                <span class="brand-sub-badge">LMS & KM</span>
              </div>
              <span class="brand-subtitle">Soft Inter Chiangrai</span>
            </div>
          </a>
        </div>

        <!-- 2. Primary Navigation Links (Desktop: >= 1180px) -->
        <nav class="nav-links">
          <a
            routerLink="/courses"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            class="nav-item"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="nav-text">หลักสูตรทั้งหมด</span>
          </a>

          <a
            routerLink="/my-learning"
            routerLinkActive="active"
            class="nav-item"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span class="nav-text">การเรียนของฉัน</span>
            <span class="badge-pill">{{ user().inProgressCount }}</span>
          </a>

          <a
            routerLink="/km"
            routerLinkActive="active"
            class="nav-item"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span class="nav-text">คลังความรู้ KM</span>
          </a>

          @if (isAdmin() || isInstructor()) {
            <a
              routerLink="/admin"
              routerLinkActive="active"
              class="nav-item nav-item-admin"
            >
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span class="nav-text">{{ isAdmin() ? 'แดชบอร์ดแอดมิน' : 'จัดการคอร์สผู้สอน' }}</span>
            </a>
          }
        </nav>

        <!-- 3. Right Actions Section -->
        <div class="actions-section">
          <!-- Role Switcher Dropdown -->
          <div class="role-dropdown-wrapper">
            <button
              type="button"
              class="role-dropdown-btn"
              [ngClass]="'role-btn-' + currentRole()"
              (click)="toggleRoleDropdown($event)"
              title="คลิกเพื่อสลับสิทธิ์จำลอง"
            >
              <span class="role-icon-badge">{{ getRoleIcon(currentRole()) }}</span>
              <span class="role-name-text">{{ getRoleLabel(currentRole()) }}</span>
              <svg class="chevron-icon" [class.rotated]="isRoleDropdownOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            @if (isRoleDropdownOpen()) {
              <div class="role-dropdown-menu" (click)="$event.stopPropagation()">
                <div class="menu-header">เลือกสิทธิ์สำหรับทดสอบ:</div>
                <button
                  type="button"
                  class="role-menu-item"
                  [class.active]="currentRole() === 'learner'"
                  (click)="selectRole('learner')"
                >
                  <span class="item-icon">🎒</span>
                  <div class="item-info">
                    <span class="item-title">ผู้เรียน (Learner)</span>
                    <span class="item-desc">ดูคอร์ส, เข้าเรียน, ทำข้อสอบ</span>
                  </div>
                  @if (currentRole() === 'learner') {
                    <span class="check-mark">✓</span>
                  }
                </button>

                <button
                  type="button"
                  class="role-menu-item"
                  [class.active]="currentRole() === 'instructor'"
                  (click)="selectRole('instructor')"
                >
                  <span class="item-icon">👨‍🏫</span>
                  <div class="item-info">
                    <span class="item-title">ผู้สอน (Instructor)</span>
                    <span class="item-desc">สร้างหลักสูตร, จัดการบทเรียน</span>
                  </div>
                  @if (currentRole() === 'instructor') {
                    <span class="check-mark">✓</span>
                  }
                </button>

                <button
                  type="button"
                  class="role-menu-item"
                  [class.active]="currentRole() === 'admin'"
                  (click)="selectRole('admin')"
                >
                  <span class="item-icon">🛡️</span>
                  <div class="item-info">
                    <span class="item-title">ผู้ดูแลระบบ (Admin)</span>
                    <span class="item-desc">จัดการสิทธิ์, รายงานภาพรวม</span>
                  </div>
                  @if (currentRole() === 'admin') {
                    <span class="check-mark">✓</span>
                  }
                </button>
              </div>
            }
          </div>

          <!-- AI Assistant Quick Launch Button -->
          <button
            type="button"
            class="ai-quick-btn"
            (click)="openAiAssistant()"
            title="ปรึกษา SICR AI Knowledge Assistant"
            aria-label="Open AI Assistant"
          >
            <span class="ai-sparkle">✨</span>
            <span class="ai-label">AI Assistant</span>
          </button>

          <!-- Help & Guide Button -->
          <button
            type="button"
            class="help-guide-btn"
            (click)="openUserGuide()"
            title="คู่มือการใช้งานระบบ (Help & User Guide)"
            aria-label="Help and User Guide"
          >
            <span class="help-icon">❓</span>
            <span class="help-text">คู่มือ</span>
          </button>

          <!-- Theme Toggle Button -->
          <button
            type="button"
            class="theme-toggle-btn"
            (click)="toggleTheme()"
            [title]="isDarkMode() ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'"
            aria-label="Toggle theme"
          >
            @if (isDarkMode()) {
              <svg class="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            } @else {
              <svg class="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>

          <!-- User Profile Pill -->
          <div class="user-profile-widget">
            <img [src]="user().avatarUrl" [alt]="user().name" class="user-avatar" />
            <div class="user-info">
              <span class="user-name">{{ user().thaiName }}</span>
              <span class="role-tag" [ngClass]="'role-' + currentRole()">
                {{ getRoleBadgeText(currentRole()) }}
              </span>
            </div>
          </div>

          <!-- Mobile Hamburger Menu Button (< 1180px) -->
          <button
            type="button"
            class="mobile-menu-btn"
            (click)="toggleMobileMenu()"
            aria-label="Toggle mobile menu"
          >
            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (isMobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Navigation Drawer (< 1180px) -->
      @if (isMobileMenuOpen()) {
        <div class="mobile-drawer">
          <nav class="mobile-nav-list">
            <a routerLink="/courses" routerLinkActive="active" class="mobile-nav-item" (click)="closeAllMenus()">
              <span>🎓 หลักสูตรทั้งหมด</span>
            </a>
            <a routerLink="/my-learning" routerLinkActive="active" class="mobile-nav-item" (click)="closeAllMenus()">
              <span>📚 การเรียนของฉัน ({{ user().inProgressCount }})</span>
            </a>
            <a routerLink="/km" routerLinkActive="active" class="mobile-nav-item" (click)="closeAllMenus()">
              <span>💡 คลังความรู้ KM</span>
            </a>
            @if (isAdmin() || isInstructor()) {
              <a routerLink="/admin" routerLinkActive="active" class="mobile-nav-item" (click)="closeAllMenus()">
                <span>🛡️ {{ isAdmin() ? 'แดชบอร์ดแอดมิน' : 'จัดการคอร์สผู้สอน' }}</span>
              </a>
            }
            <button type="button" class="mobile-nav-item mobile-ai-btn" (click)="openAiAssistantMobile()">
              <span>✨ 🤖 ปรึกษา SICR AI Assistant</span>
            </button>
            <button type="button" class="mobile-nav-item mobile-guide-btn" (click)="openUserGuideMobile()">
              <span>📖 คู่มือการใช้งานระบบ (Help & Guide)</span>
            </button>
          </nav>
        </div>
      }
    </header>
  `,
  styles: [`
    .sicr-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--sic-color-bg, #ffffff);
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      backdrop-filter: blur(12px);
      box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.04);
      transition: background-color 0.25s ease, border-color 0.25s ease;
      width: 100%;
      box-sizing: border-box;
      overflow: visible;
    }

    .header-container {
      max-width: 1720px;
      margin: 0 auto;
      padding: 0 clamp(0.75rem, 2vw, 2rem);
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      box-sizing: border-box;
      width: 100%;
    }

    /* 1. Brand Logo & Name */
    .brand-section {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 11px;
      background: linear-gradient(135deg, #00a887 0%, #007965 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.28);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .brand-link:hover .brand-icon {
      transform: scale(1.04);
    }

    .icon-text {
      color: #ffffff;
      font-weight: 800;
      font-size: 0.92rem;
      letter-spacing: -0.5px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      white-space: nowrap;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .brand-title {
      font-size: 1.08rem;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: var(--sic-color-text-active, #0f172a);
      background: linear-gradient(120deg, #00a887, #0284c7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }

    .brand-sub-badge {
      font-size: 0.62rem;
      font-weight: 800;
      padding: 0.1rem 0.4rem;
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
      border-radius: 5px;
      letter-spacing: 0.4px;
      white-space: nowrap;
    }

    .brand-subtitle {
      font-size: 0.72rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 500;
      white-space: nowrap;
    }

    /* 2. Navigation Links */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-shrink: 0;
    }

    .nav-item {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.75rem;
      border-radius: 9px;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--sic-color-text-muted, #64748b);
      transition: all 0.2s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .nav-item:hover {
      color: #00a887;
      background: rgba(0, 168, 135, 0.08);
    }

    .nav-item.active {
      color: #00a887;
      background: rgba(0, 168, 135, 0.12);
    }

    .nav-item-admin {
      color: #8b5cf6;
    }
    .nav-item-admin:hover, .nav-item-admin.active {
      color: #7c3aed;
      background: rgba(124, 58, 237, 0.12);
    }

    .nav-icon {
      width: 17px;
      height: 17px;
      min-width: 17px;
      flex-shrink: 0;
    }

    .nav-text {
      white-space: nowrap;
    }

    .badge-pill {
      font-size: 0.68rem;
      padding: 0.1rem 0.42rem;
      border-radius: 999px;
      background: #00a887;
      color: #ffffff;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }

    /* 3. Actions Section */
    .actions-section {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-shrink: 0;
    }

    /* Role Dropdown Button */
    .role-dropdown-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .role-dropdown-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      height: 38px;
      padding: 0 0.75rem;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-surface, #f8fafc);
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 700;
      font-family: inherit;
      color: var(--sic-color-text-active, #0f172a);
      transition: all 0.2s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .role-dropdown-btn:hover {
      border-color: #00a887;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .role-btn-learner {
      border-color: rgba(0, 168, 135, 0.35);
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
    }

    .role-btn-instructor {
      border-color: rgba(59, 130, 246, 0.35);
      background: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
    }

    .role-btn-admin {
      border-color: rgba(139, 92, 246, 0.35);
      background: rgba(139, 92, 246, 0.08);
      color: #8b5cf6;
    }

    .role-icon-badge {
      font-size: 0.95rem;
      line-height: 1;
    }

    .role-name-text {
      white-space: nowrap;
    }

    .chevron-icon {
      width: 14px;
      height: 14px;
      transition: transform 0.2s ease;
      color: var(--sic-color-text-muted, #64748b);
    }

    .chevron-icon.rotated {
      transform: rotate(180deg);
    }

    /* Floating Dropdown Menu */
    .role-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 250px;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 0.5rem;
      box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.15);
      z-index: 1100;
      animation: dropdownFadeIn 0.18s ease;
    }

    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .menu-header {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      padding: 0.4rem 0.6rem 0.3rem 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-menu-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      width: 100%;
      padding: 0.55rem 0.65rem;
      border-radius: 10px;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease;
    }

    .role-menu-item:hover {
      background: var(--sic-color-surface, #f8fafc);
    }

    .role-menu-item.active {
      background: rgba(0, 168, 135, 0.1);
    }

    .item-icon {
      font-size: 1.25rem;
      line-height: 1;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .item-title {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
    }

    .item-desc {
      font-size: 0.7rem;
      color: var(--sic-color-text-muted, #64748b);
    }

    .check-mark {
      color: #00a887;
      font-weight: 800;
      font-size: 0.95rem;
    }

    /* Help & Guide Button */
    .help-guide-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      height: 38px;
      padding: 0 0.65rem;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-surface, #f8fafc);
      color: var(--sic-color-text-active, #0f172a);
      font-size: 0.8rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .help-guide-btn:hover {
      border-color: #00a887;
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
    }

    .help-icon {
      font-size: 0.88rem;
    }

    .help-text {
      white-space: nowrap;
    }

    /* Theme Toggle */
    .theme-toggle-btn {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-surface, #f8fafc);
      color: var(--sic-color-text, #334155);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .theme-toggle-btn:hover {
      background: rgba(0, 168, 135, 0.1);
      color: #00a887;
      border-color: #00a887;
    }

    .theme-icon {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
    }

    /* User Profile */
    .user-profile-widget {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding-left: 0.55rem;
      border-left: 1px solid var(--sic-color-border, #e2e8f0);
      flex-shrink: 0;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #00a887;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }

    .user-name {
      font-size: 0.83rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      white-space: nowrap;
    }

    .role-tag {
      font-size: 0.62rem;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .role-learner {
      background: rgba(0, 168, 135, 0.15);
      color: #00a887;
    }
    .role-instructor {
      background: rgba(59, 130, 246, 0.15);
      color: #2563eb;
    }
    .role-admin {
      background: rgba(139, 92, 246, 0.15);
      color: #7c3aed;
    }

    .mobile-menu-btn {
      display: none;
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-surface, #f8fafc);
      color: var(--sic-color-text, #334155);
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    .menu-icon {
      width: 20px;
      height: 20px;
    }

    /* Mobile Drawer */
    .mobile-drawer {
      display: none;
      background: var(--sic-color-bg, #ffffff);
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 1rem 1.25rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .mobile-nav-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .mobile-nav-item {
      padding: 0.75rem 1rem;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      color: var(--sic-color-text, #1e293b);
      background: var(--sic-color-surface, #f8fafc);
      transition: all 0.2s ease;
      border: none;
      font-family: inherit;
      font-size: inherit;
      text-align: left;
      cursor: pointer;
    }

    .mobile-nav-item.active {
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
    }

    .mobile-guide-btn {
      background: rgba(0, 168, 135, 0.08);
      color: #00a887;
      border: 1px dashed rgba(0, 168, 135, 0.35);
    }

    /* AI Quick Button */
    .ai-quick-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      height: 38px;
      padding: 0 0.75rem;
      border-radius: 10px;
      border: 1px solid rgba(0, 168, 135, 0.35);
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%);
      color: #00a887;
      font-size: 0.8rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .ai-quick-btn:hover {
      background: linear-gradient(135deg, #00a887 0%, #0284c7 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.3);
      transform: translateY(-1px);
    }

    .ai-sparkle {
      font-size: 0.85rem;
    }

    .ai-label {
      white-space: nowrap;
    }

    .mobile-ai-btn {
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%);
      color: #00a887;
      font-weight: 700;
      border: 1px solid rgba(0, 168, 135, 0.3);
    }

    /* Responsive Breakpoints */
    @media (max-width: 1366px) {
      .user-name {
        display: none;
      }
    }

    @media (max-width: 1180px) {
      .nav-links {
        display: none;
      }
      .mobile-menu-btn {
        display: flex;
      }
      .mobile-drawer {
        display: block;
      }
    }

    @media (max-width: 600px) {
      .brand-subtitle,
      .brand-sub-badge {
        display: none;
      }
      .role-name-text,
      .help-text,
      .ai-label {
        display: none;
      }
      .role-dropdown-btn,
      .help-guide-btn,
      .ai-quick-btn {
        padding: 0 0.5rem;
      }
    }
  `],
})
export class NavHeaderComponent {
  private readonly authState = inject(AuthStateService);
  private readonly themeService = inject(SicThemeService);
  private readonly userGuideService = inject(UserGuideService);
  private readonly aiAssistantService = inject(AiAssistantService);
  private readonly elementRef = inject(ElementRef);

  readonly currentRole = this.authState.currentRole;
  readonly user = this.authState.currentUser;
  readonly isAdmin = this.authState.isAdmin;
  readonly isInstructor = this.authState.isInstructor;

  readonly isMobileMenuOpen = signal(false);
  readonly isRoleDropdownOpen = signal(false);
  readonly isDarkMode = computed(() => this.themeService.isDark());

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  toggleRoleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isRoleDropdownOpen.update((v) => !v);
  }

  selectRole(role: UserRole): void {
    this.authState.switchRole(role);
    this.isRoleDropdownOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleDark();
  }

  openAiAssistant(): void {
    this.aiAssistantService.openChat();
  }

  openAiAssistantMobile(): void {
    this.closeAllMenus();
    this.openAiAssistant();
  }

  openUserGuide(): void {
    const role = this.currentRole();
    const tabMap: Record<UserRole, 'learner' | 'instructor' | 'admin'> = {
      learner: 'learner',
      instructor: 'instructor',
      admin: 'admin',
    };
    this.userGuideService.openGuide(tabMap[role] || 'learner');
  }

  openUserGuideMobile(): void {
    this.closeAllMenus();
    this.openUserGuide();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeAllMenus(): void {
    this.isMobileMenuOpen.set(false);
    this.isRoleDropdownOpen.set(false);
  }

  getRoleIcon(role: UserRole): string {
    switch (role) {
      case 'learner':
        return '🎒';
      case 'instructor':
        return '👨‍🏫';
      case 'admin':
        return '🛡️';
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'learner':
        return 'ผู้เรียน';
      case 'instructor':
        return 'ผู้สอน';
      case 'admin':
        return 'แอดมิน';
    }
  }

  getRoleBadgeText(role: UserRole): string {
    switch (role) {
      case 'learner':
        return 'Learner';
      case 'instructor':
        return 'Instructor';
      case 'admin':
        return 'Admin';
    }
  }
}

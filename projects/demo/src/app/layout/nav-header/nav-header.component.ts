import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SicThemeService } from 'sic-ng';
import { AuthStateService } from '../../core/services/auth-state.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sicr-header">
      <div class="header-container">
        <!-- 1. Brand Logo & Name -->
        <div class="brand-section">
          <a routerLink="/" class="brand-link" (click)="closeMobileMenu()">
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

        <!-- 2. Primary Navigation Links (Desktop) -->
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

        <!-- 3. Global Controls & Actions -->
        <div class="actions-section">
          <!-- Role Switcher Segmented Control -->
          <div class="role-switcher-container">
            <span class="role-label">สิทธิ์:</span>
            <div class="segmented-control">
              <button
                type="button"
                class="seg-btn"
                [class.active]="currentRole() === 'learner'"
                (click)="setRole('learner')"
                title="สลับมุมมองเป็น ผู้เรียน (Learner)"
              >
                <span class="seg-icon">🎒</span>
                <span class="seg-text">ผู้เรียน</span>
              </button>
              <button
                type="button"
                class="seg-btn"
                [class.active]="currentRole() === 'instructor'"
                (click)="setRole('instructor')"
                title="สลับมุมมองเป็น ผู้สอน (Instructor)"
              >
                <span class="seg-icon">👨‍🏫</span>
                <span class="seg-text">ผู้สอน</span>
              </button>
              <button
                type="button"
                class="seg-btn"
                [class.active]="currentRole() === 'admin'"
                (click)="setRole('admin')"
                title="สลับมุมมองเป็น ผู้ดูแลระบบ (Admin)"
              >
                <span class="seg-icon">🛡️</span>
                <span class="seg-text">แอดมิน</span>
              </button>
            </div>
          </div>

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

          <!-- User Profile Widget -->
          <div class="user-profile-widget">
            <img [src]="user().avatarUrl" [alt]="user().name" class="user-avatar" />
            <div class="user-info">
              <div class="user-name-line">
                <span class="user-name">{{ user().thaiName }}</span>
                <span class="role-tag" [ngClass]="'role-' + currentRole()">
                  {{ getRoleBadgeText(currentRole()) }}
                </span>
              </div>
              <span class="user-dept">{{ user().department }}</span>
            </div>
          </div>

          <!-- Mobile / Small Screen Hamburger Menu Button -->
          <button
            type="button"
            class="mobile-menu-btn"
            (click)="toggleMobileMenu()"
            aria-label="Toggle navigation menu"
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

      <!-- Mobile Dropdown Navigation Drawer -->
      @if (isMobileMenuOpen()) {
        <div class="mobile-drawer">
          <nav class="mobile-nav-list">
            <a routerLink="/courses" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
              <span>🎓 หลักสูตรทั้งหมด</span>
            </a>
            <a routerLink="/my-learning" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
              <span>📚 การเรียนของฉัน ({{ user().inProgressCount }})</span>
            </a>
            <a routerLink="/km" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
              <span>💡 คลังความรู้ KM</span>
            </a>
            @if (isAdmin() || isInstructor()) {
              <a routerLink="/admin" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
                <span>🛡️ {{ isAdmin() ? 'แดชบอร์ดแอดมิน' : 'จัดการคอร์สผู้สอน' }}</span>
              </a>
            }
          </nav>

          <div class="mobile-role-section">
            <div class="mobile-role-title">สลับสิทธิ์จำลอง:</div>
            <div class="mobile-role-buttons">
              <button
                type="button"
                class="mobile-role-btn"
                [class.active]="currentRole() === 'learner'"
                (click)="setRole('learner')"
              >
                🎒 ผู้เรียน
              </button>
              <button
                type="button"
                class="mobile-role-btn"
                [class.active]="currentRole() === 'instructor'"
                (click)="setRole('instructor')"
              >
                👨‍🏫 ผู้สอน
              </button>
              <button
                type="button"
                class="mobile-role-btn"
                [class.active]="currentRole() === 'admin'"
                (click)="setRole('admin')"
              >
                🛡️ แอดมิน
              </button>
            </div>
          </div>
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
    }

    .header-container {
      max-width: 1720px;
      margin: 0 auto;
      padding: 0 clamp(1rem, 2.5vw, 2.5rem);
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: clamp(0.75rem, 1.5vw, 2rem);
      box-sizing: border-box;
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
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 42px;
      height: 42px;
      min-width: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #00a887 0%, #007965 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.3);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .brand-link:hover .brand-icon {
      transform: scale(1.04);
    }

    .icon-text {
      color: #ffffff;
      font-weight: 800;
      font-size: 0.95rem;
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
      gap: 0.45rem;
    }

    .brand-title {
      font-size: 1.12rem;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: var(--sic-color-text-active, #0f172a);
      background: linear-gradient(120deg, #00a887, #0284c7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }

    .brand-sub-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.12rem 0.45rem;
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
      border-radius: 6px;
      letter-spacing: 0.4px;
      white-space: nowrap;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 500;
      white-space: nowrap;
    }

    /* 2. Navigation Links (Desktop) */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-shrink: 0;
    }

    .nav-item {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.85rem;
      border-radius: 10px;
      text-decoration: none;
      font-size: 0.9rem;
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
      width: 18px;
      height: 18px;
      min-width: 18px;
      flex-shrink: 0;
    }

    .nav-text {
      white-space: nowrap;
    }

    .badge-pill {
      font-size: 0.7rem;
      padding: 0.1rem 0.45rem;
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
      gap: 0.85rem;
      flex-shrink: 0;
    }

    /* Role Switcher Segmented Control */
    .role-switcher-container {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--sic-color-surface, #f8fafc);
      padding: 0.2rem 0.3rem;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-sizing: border-box;
      height: 38px;
      flex-shrink: 0;
    }

    .role-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      padding-left: 0.4rem;
      white-space: nowrap;
      user-select: none;
      line-height: 1;
    }

    .segmented-control {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      height: 100%;
    }

    .seg-btn {
      border: none;
      background: transparent;
      padding: 0 0.65rem;
      height: 30px;
      border-radius: 7px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--sic-color-text-muted, #64748b);
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      white-space: nowrap;
      line-height: 1;
      font-family: inherit;
      box-sizing: border-box;
    }

    .seg-icon {
      font-size: 0.9rem;
      line-height: 1;
      display: inline-flex;
      align-items: center;
    }

    .seg-text {
      white-space: nowrap;
      line-height: 1;
    }

    .seg-btn:hover {
      color: var(--sic-color-text-active, #0f172a);
      background: rgba(0, 0, 0, 0.04);
    }

    .seg-btn.active {
      background: #00a887;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(0, 168, 135, 0.3);
      font-weight: 700;
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
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    /* User Profile */
    .user-profile-widget {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding-left: 0.65rem;
      border-left: 1px solid var(--sic-color-border, #e2e8f0);
      flex-shrink: 0;
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #00a887;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      white-space: nowrap;
    }

    .user-name-line {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--sic-color-text-active, #0f172a);
      white-space: nowrap;
    }

    .role-tag {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.1rem 0.4rem;
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

    .user-dept {
      font-size: 0.72rem;
      color: var(--sic-color-text-muted, #64748b);
      white-space: nowrap;
    }

    .mobile-menu-btn {
      display: none;
      width: 40px;
      height: 40px;
      min-width: 40px;
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
      width: 22px;
      height: 22px;
    }

    /* Mobile Drawer */
    .mobile-drawer {
      display: none;
      background: var(--sic-color-bg, #ffffff);
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 1rem 1.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .mobile-nav-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .mobile-nav-item {
      padding: 0.75rem 1rem;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      color: var(--sic-color-text, #1e293b);
      background: var(--sic-color-surface, #f8fafc);
      transition: all 0.2s ease;
    }

    .mobile-nav-item.active {
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
    }

    .mobile-role-section {
      padding-top: 0.75rem;
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .mobile-role-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      margin-bottom: 0.5rem;
    }

    .mobile-role-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .mobile-role-btn {
      flex: 1;
      padding: 0.6rem 0.5rem;
      border-radius: 8px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-surface, #f8fafc);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--sic-color-text, #1e293b);
    }

    .mobile-role-btn.active {
      background: #00a887;
      color: #ffffff;
      border-color: #00a887;
    }

    /* Responsive Breakpoints */
    @media (max-width: 1280px) {
      .user-dept {
        display: none;
      }
      .role-switcher-container .role-label {
        display: none;
      }
    }

    @media (max-width: 1100px) {
      .role-switcher-container {
        display: none;
      }
    }

    @media (max-width: 868px) {
      .nav-links {
        display: none;
      }
      .user-info {
        display: none;
      }
      .mobile-menu-btn {
        display: flex;
      }
      .mobile-drawer {
        display: block;
      }
    }
  `],
})
export class NavHeaderComponent {
  private readonly authState = inject(AuthStateService);
  private readonly themeService = inject(SicThemeService);

  readonly currentRole = this.authState.currentRole;
  readonly user = this.authState.currentUser;
  readonly isAdmin = this.authState.isAdmin;
  readonly isInstructor = this.authState.isInstructor;

  readonly isMobileMenuOpen = signal(false);
  readonly isDarkMode = computed(() => this.themeService.isDark());

  setRole(role: UserRole): void {
    this.authState.switchRole(role);
  }

  toggleTheme(): void {
    this.themeService.toggleDark();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
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

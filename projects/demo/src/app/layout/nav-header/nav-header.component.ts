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
          <a routerLink="/" class="brand-link">
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

        <!-- 2. Primary Navigation Links -->
        <nav class="nav-links" [class.nav-open]="isMobileMenuOpen()">
          <a
            routerLink="/courses"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            class="nav-item"
            (click)="closeMobileMenu()"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>หลักสูตรทั้งหมด</span>
          </a>

          <a
            routerLink="/my-learning"
            routerLinkActive="active"
            class="nav-item"
            (click)="closeMobileMenu()"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>การเรียนของฉัน</span>
            <span class="badge-pill">{{ user().inProgressCount }}</span>
          </a>

          <a
            routerLink="/km"
            routerLinkActive="active"
            class="nav-item"
            (click)="closeMobileMenu()"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>คลังความรู้ KM</span>
          </a>

          @if (isAdmin() || isInstructor()) {
            <a
              routerLink="/admin"
              routerLinkActive="active"
              class="nav-item nav-item-admin"
              (click)="closeMobileMenu()"
            >
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>{{ isAdmin() ? 'แดชบอร์ดแอดมิน' : 'จัดการคอร์สผู้สอน' }}</span>
            </a>
          }
        </nav>

        <!-- 3. Global Controls & Actions -->
        <div class="actions-section">
          <!-- Role Switcher (Simulation for testing) -->
          <div class="role-switcher-container">
            <span class="role-label">สิทธิ์:</span>
            <div class="role-pills">
              <button
                type="button"
                class="role-pill"
                [class.active]="currentRole() === 'learner'"
                (click)="setRole('learner')"
                title="สลับเป็นมุมมอง Learner (ผู้เรียน)"
              >
                🎒 ผู้เรียน
              </button>
              <button
                type="button"
                class="role-pill"
                [class.active]="currentRole() === 'instructor'"
                (click)="setRole('instructor')"
                title="สลับเป็นมุมมอง Instructor (ผู้สอน)"
              >
                👨‍🏫 ผู้สอน
              </button>
              <button
                type="button"
                class="role-pill"
                [class.active]="currentRole() === 'admin'"
                (click)="setRole('admin')"
                title="สลับเป็นมุมมอง Admin (ผู้ดูแลระบบ)"
              >
                🛡️ แอดมิน
              </button>
            </div>
          </div>

          <!-- Theme Toggle Button -->
          <button
            type="button"
            class="theme-toggle-btn"
            (click)="toggleTheme()"
            [title]="isDarkMode() ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'"
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

          <!-- Mobile Menu Button -->
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
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
      transition: background-color 0.25s ease, border-color 0.25s ease;
    }

    .header-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    /* Brand Logo */
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
      border-radius: 12px;
      background: linear-gradient(135deg, #00a887 0%, #007965 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.35);
      transition: transform 0.2s ease;
    }

    .brand-link:hover .brand-icon {
      transform: scale(1.05);
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
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--sic-color-text-active, #0f172a);
      background: linear-gradient(120deg, #00a887, #0284c7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-sub-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 500;
    }

    /* Navigation Links */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 0.95rem;
      border-radius: 10px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--sic-color-text-muted, #64748b);
      transition: all 0.2s ease;
      position: relative;
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
    }

    .badge-pill {
      font-size: 0.7rem;
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      background: #00a887;
      color: #ffffff;
      font-weight: 700;
    }

    /* Actions Section */
    .actions-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Role Switcher */
    .role-switcher-container {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--sic-color-surface, #f8fafc);
      padding: 0.25rem 0.4rem;
      border-radius: 12px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .role-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--sic-color-text-muted, #64748b);
      padding-left: 0.35rem;
    }

    .role-pills {
      display: flex;
      gap: 0.2rem;
    }

    .role-pill {
      border: none;
      background: transparent;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--sic-color-text-muted, #64748b);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .role-pill:hover {
      color: var(--sic-color-text-active, #0f172a);
    }

    .role-pill.active {
      background: #00a887;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(0, 168, 135, 0.3);
    }

    /* Theme Toggle */
    .theme-toggle-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-surface, #f8fafc);
      color: var(--sic-color-text, #334155);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .theme-toggle-btn:hover {
      background: rgba(0, 168, 135, 0.1);
      color: #00a887;
      border-color: #00a887;
    }

    .theme-icon {
      width: 18px;
      height: 18px;
    }

    /* User Profile */
    .user-profile-widget {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding-left: 0.5rem;
      border-left: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #00a887;
    }

    .user-info {
      display: flex;
      flex-direction: column;
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
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      text-transform: uppercase;
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
    }

    .mobile-menu-btn {
      display: none;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-surface, #f8fafc);
      color: var(--sic-color-text, #334155);
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .menu-icon {
      width: 22px;
      height: 22px;
    }

    /* Responsive */
    @media (max-width: 1080px) {
      .role-switcher-container {
        display: none;
      }
    }

    @media (max-width: 868px) {
      .mobile-menu-btn {
        display: flex;
      }

      .user-info {
        display: none;
      }

      .nav-links {
        display: none;
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        background: var(--sic-color-bg, #ffffff);
        border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }

      .nav-links.nav-open {
        display: flex;
      }

      .nav-item {
        width: 100%;
        padding: 0.8rem 1rem;
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

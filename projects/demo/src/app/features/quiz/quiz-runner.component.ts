import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { CoursesService } from '../../core/services/courses.service';
import { Quiz, QuizAttempt, QuizQuestion } from '../../core/models/quiz.model';
import { Course } from '../../core/models/course.model';

type QuizMode = 'intro' | 'taking' | 'result' | 'review';

@Component({
  selector: 'app-quiz-runner',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="quiz-container" *ngIf="quiz(); else notFound">
      <!-- ================= 1. INTRO SCREEN ================= -->
      <div class="quiz-card intro-card" *ngIf="mode() === 'intro'">
        <div class="intro-header">
          <div class="breadcrumb-nav">
            <a [routerLink]="['/courses', course()?.slug || course()?.id]" class="crumb-link">
              ← {{ course()?.title }}
            </a>
          </div>
          <div class="badge-row">
            <span class="quiz-badge">📝 แบบทดสอบประเมินผล</span>
            <span class="xp-badge">✨ +{{ quiz()!.xpAward }} XP</span>
          </div>
          <h1 class="quiz-title">{{ quiz()!.thaiTitle || quiz()!.title }}</h1>
          <p class="quiz-subtitle" *ngIf="quiz()!.thaiTitle">{{ quiz()!.title }}</p>
          <p class="quiz-desc">{{ quiz()!.description }}</p>
        </div>

        <!-- Metric Grid -->
        <div class="intro-metrics">
          <div class="metric-item">
            <div class="metric-icon">❓</div>
            <div class="metric-val">{{ quiz()!.questions.length }} ข้อ</div>
            <div class="metric-label">จำนวนคำถาม</div>
          </div>
          <div class="metric-item">
            <div class="metric-icon">⏱️</div>
            <div class="metric-val">
              {{ quiz()!.timeLimitMinutes > 0 ? quiz()!.timeLimitMinutes + ' นาที' : 'ไม่จำกัด' }}
            </div>
            <div class="metric-label">เวลาที่กำหนด</div>
          </div>
          <div class="metric-item">
            <div class="metric-icon">🎯</div>
            <div class="metric-val">{{ quiz()!.passingScorePercent }}%</div>
            <div class="metric-label">เกณฑ์คะแนนผ่าน</div>
          </div>
          <div class="metric-item">
            <div class="metric-icon">🏆</div>
            <div class="metric-val">{{ totalPoints() }} คะแนน</div>
            <div class="metric-label">คะแนนเต็ม</div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="intro-instructions">
          <h3>📌 ข้อกำหนดและคำแนะนำในการสอบ:</h3>
          <ul>
            <li>แบบทดสอบประกอบด้วยคำถามแบบปรนัย (Single/Multiple Choice) และถูก/ผิด (True/False)</li>
            <li>สามารถคลิกเลือกตัวเลขข้อสอบเพื่อข้ามไปทำข้อที่ต้องการ หรือปักหมุด 🚩 เพื่อกลับมาทบทวนได้</li>
            <li>เมื่อเริ่มทำแบบทดสอบ ตัวจับเวลาจะเริ่มนับถอยหลังทันที และส่งคำตอบอัตโนมัติหากหมดเวลา</li>
            <li>เมื่อสอบผ่านเกณฑ์ {{ quiz()!.passingScorePercent }}% ระบบจะบันทึกสถานะเรียนจบและมอบ XP ให้ทันที</li>
          </ul>
        </div>

        <!-- Latest Attempt History (if any) -->
        <div class="latest-attempt-banner" *ngIf="latestAttempt()" [class.passed]="latestAttempt()!.isPassed">
          <div class="attempt-icon">{{ latestAttempt()!.isPassed ? '🎉' : '⚠️' }}</div>
          <div class="attempt-info">
            <div class="attempt-title">
              ผลการสอบล่าสุด: <strong>{{ latestAttempt()!.percent }}%</strong>
              ({{ latestAttempt()!.score }}/{{ latestAttempt()!.maxScore }} คะแนน) —
              <span class="attempt-status">{{ latestAttempt()!.isPassed ? 'ผ่านเกณฑ์แล้ว' : 'ยังไม่ผ่านเกณฑ์' }}</span>
            </div>
            <div class="attempt-date">สอบเมื่อ: {{ formatDate(latestAttempt()!.submittedAt) }}</div>
          </div>
          <button type="button" class="btn-review-past" (click)="openReviewMode(latestAttempt()!)">
            🧐 ดูเฉลยล่าสุด
          </button>
        </div>

        <!-- Start Action Button -->
        <div class="intro-actions">
          <button type="button" class="btn-start-exam" (click)="startQuiz()">
            🚀 เริ่มทำแบบทดสอบทันที
          </button>
          <a [routerLink]="['/courses', course()?.slug || course()?.id, 'learn']" class="btn-back-learn">
            กลับไปห้องเรียน
          </a>
        </div>
      </div>

      <!-- ================= 2. ACTIVE QUIZ TAKING SCREEN ================= -->
      <div class="taking-view" *ngIf="mode() === 'taking'">
        <!-- Sticky Topbar -->
        <div class="taking-topbar">
          <div class="topbar-left">
            <button type="button" class="btn-exit" (click)="confirmExit()" title="ออกจากแบบทดสอบ">
              ✕ <span class="exit-text">ออก</span>
            </button>
            <div class="topbar-quiz-info">
              <span class="topbar-quiz-title">{{ quiz()!.title }}</span>
              <span class="topbar-progress-count">
                ข้อที่ {{ currentQuestionIndex() + 1 }} จาก {{ quiz()!.questions.length }}
                ({{ answeredCount() }}/{{ quiz()!.questions.length }} ตอบแล้ว)
              </span>
            </div>
          </div>

          <div class="topbar-right">
            <!-- Timer Badge -->
            <div
              class="timer-badge"
              *ngIf="quiz()!.timeLimitMinutes > 0"
              [class.warning]="timeRemainingSeconds() < 120"
              [class.critical]="timeRemainingSeconds() < 60"
            >
              <span class="timer-icon">⏱️</span>
              <span class="timer-digits">{{ formatTimer(timeRemainingSeconds()) }}</span>
            </div>

            <button type="button" class="btn-submit-header" (click)="openSubmitDialog()">
              📤 ส่งข้อสอบ
            </button>
          </div>
        </div>

        <div class="taking-layout">
          <!-- Left: Question Stepper Navigator -->
          <aside class="question-navigator">
            <div class="nav-card">
              <div class="nav-card-header">
                <span class="nav-title">📋 นำทางข้อสอบ</span>
                <span class="nav-stat">{{ answeredCount() }}/{{ quiz()!.questions.length }}</span>
              </div>
              <div class="nav-legend">
                <span class="legend-item"><span class="dot answered"></span> ตอบแล้ว</span>
                <span class="legend-item"><span class="dot unanswered"></span> ยังไม่ตอบ</span>
                <span class="legend-item"><span class="dot flagged"></span> ปักหมุด</span>
              </div>
              <div class="nav-grid">
                <button
                  *ngFor="let q of quiz()!.questions; let idx = index"
                  type="button"
                  class="nav-btn"
                  [class.current]="currentQuestionIndex() === idx"
                  [class.answered]="isQuestionAnswered(q.id)"
                  [class.flagged]="isQuestionFlagged(q.id)"
                  (click)="jumpToQuestion(idx)"
                  [attr.aria-label]="'ข้อที่ ' + (idx + 1)"
                >
                  <span class="nav-num">{{ idx + 1 }}</span>
                  <span *ngIf="isQuestionFlagged(q.id)" class="flag-icon">🚩</span>
                </button>
              </div>

              <div class="nav-bottom-submit">
                <button type="button" class="btn-nav-submit" (click)="openSubmitDialog()">
                  📤 ตรวจทานและส่งข้อสอบ
                </button>
              </div>
            </div>
          </aside>

          <!-- Right / Center: Current Question Card -->
          <main class="question-main">
            <div class="question-card" *ngIf="currentQuestion()">
              <!-- Question Header -->
              <div class="q-header">
                <div class="q-index-row">
                  <span class="q-index-badge">
                    ข้อที่ {{ currentQuestionIndex() + 1 }} / {{ quiz()!.questions.length }}
                  </span>
                  <span class="q-type-badge" [ngClass]="'type-' + currentQuestion()!.type">
                    {{ getQuestionTypeLabel(currentQuestion()!.type) }}
                  </span>
                  <span class="q-points-badge">✨ {{ currentQuestion()!.points }} คะแนน</span>
                </div>

                <button
                  type="button"
                  class="btn-flag-toggle"
                  [class.active]="isQuestionFlagged(currentQuestion()!.id)"
                  (click)="toggleFlag(currentQuestion()!.id)"
                >
                  {{ isQuestionFlagged(currentQuestion()!.id) ? '🚩 ปักหมุดแล้ว' : '🏳️ ปักหมุดทบทวน' }}
                </button>
              </div>

              <!-- Question Text -->
              <div class="q-content">
                <h2 class="q-text">{{ currentQuestion()!.text }}</h2>

                <!-- Code snippet if present -->
                <div class="q-code-snippet" *ngIf="currentQuestion()!.codeSnippet">
                  <div class="code-bar">
                    <span class="code-lang">{{ currentQuestion()!.codeLanguage || 'typescript' }}</span>
                  </div>
                  <pre><code>{{ currentQuestion()!.codeSnippet }}</code></pre>
                </div>
              </div>

              <!-- Question Options List -->
              <div class="q-options">
                <div
                  *ngFor="let opt of currentQuestion()!.options"
                  class="option-item"
                  [class.selected]="isOptionSelected(currentQuestion()!.id, opt.id)"
                  (click)="selectOption(currentQuestion()!, opt.id)"
                  role="button"
                  tabindex="0"
                  (keydown.enter)="selectOption(currentQuestion()!, opt.id)"
                  (keydown.space)="selectOption(currentQuestion()!, opt.id)"
                >
                  <div class="option-control">
                    <div
                      class="custom-check-box"
                      [class.multi]="currentQuestion()!.type === 'multi_choice'"
                      [class.checked]="isOptionSelected(currentQuestion()!.id, opt.id)"
                    >
                      <span *ngIf="isOptionSelected(currentQuestion()!.id, opt.id)" class="check-mark">
                        {{ currentQuestion()!.type === 'multi_choice' ? '✓' : '●' }}
                      </span>
                    </div>
                    <span class="option-label-circle">{{ opt.label }}</span>
                  </div>
                  <div class="option-text">{{ opt.text }}</div>
                </div>
              </div>

              <!-- Question Footer Buttons -->
              <div class="q-footer">
                <button
                  type="button"
                  class="btn-q-nav btn-q-prev"
                  [disabled]="currentQuestionIndex() === 0"
                  (click)="prevQuestion()"
                >
                  ◀ ข้อก่อนหน้า
                </button>

                <div class="q-footer-right">
                  <button
                    *ngIf="currentQuestionIndex() < quiz()!.questions.length - 1"
                    type="button"
                    class="btn-q-nav btn-q-next"
                    (click)="nextQuestion()"
                  >
                    ข้อถัดไป ▶
                  </button>

                  <button
                    *ngIf="currentQuestionIndex() === quiz()!.questions.length - 1"
                    type="button"
                    class="btn-q-nav btn-q-finish"
                    (click)="openSubmitDialog()"
                  >
                    📤 สรุปและส่งข้อสอบ
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        <!-- Submit Confirmation Modal -->
        <div class="modal-backdrop" *ngIf="showSubmitDialog()" (click)="showSubmitDialog.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-icon">📤</div>
            <h3>ยืนยันการส่งข้อสอบ?</h3>
            <p class="modal-desc">
              คุณได้ตอบไปแล้ว <strong>{{ answeredCount() }}</strong> จากทั้งหมด
              <strong>{{ quiz()!.questions.length }}</strong> ข้อ
            </p>

            <div class="modal-warn" *ngIf="unansweredCount() > 0">
              ⚠️ มีคำถามที่ยังไม่ได้ตอบ <strong>{{ unansweredCount() }} ข้อ</strong>
              คุณต้องการส่งข้อสอบทันทีหรือไม่?
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="showSubmitDialog.set(false)">
                กลับไปทำต่อ
              </button>
              <button type="button" class="btn-confirm-submit" (click)="submitQuizConfirmed()">
                ยืนยันส่งข้อสอบ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 3. RESULT SCREEN ================= -->
      <div class="quiz-card result-card" *ngIf="mode() === 'result'">
        <div class="result-hero" [class.passed]="currentAttempt()?.isPassed">
          <div class="result-hero-icon">
            {{ currentAttempt()?.isPassed ? '🎉' : '⚠️' }}
          </div>
          <h1 class="result-hero-title">
            {{ currentAttempt()?.isPassed ? 'ยินดีด้วย! คุณผ่านการประเมิน' : 'ยังไม่ผ่านเกณฑ์การประเมิน' }}
          </h1>
          <p class="result-hero-subtitle">
            {{ currentAttempt()?.isPassed ? 'คุณมีความเข้าใจในเนื้อหาตามมาตรฐานที่องค์กรกำหนด' : 'ไม่ต้องกังวล สามารถทบทวนบทเรียนและทำข้อสอบใหม่อีกครั้งได้' }}
          </p>

          <!-- Big Score Ring / Box -->
          <div class="score-display-box">
            <div class="score-percent">{{ currentAttempt()?.percent }}%</div>
            <div class="score-points">
              {{ currentAttempt()?.score }} / {{ currentAttempt()?.maxScore }} คะแนน
            </div>
            <div class="score-badge" [class.pass]="currentAttempt()?.isPassed">
              {{ currentAttempt()?.isPassed ? '✓ PASSED (ผ่าน)' : '✕ FAILED (เกณฑ์ 80%)' }}
            </div>
          </div>
        </div>

        <!-- Result Metrics Grid -->
        <div class="result-metrics">
          <div class="rm-item">
            <span class="rm-label">⏱️ เวลาที่ใช้ไป</span>
            <strong class="rm-val">{{ formatTimer(currentAttempt()?.timeSpentSeconds || 0) }}</strong>
          </div>
          <div class="rm-item">
            <span class="rm-label">✨ XP ที่ได้รับ</span>
            <strong class="rm-val">+{{ currentAttempt()?.isPassed ? quiz()!.xpAward : 0 }} XP</strong>
          </div>
          <div class="rm-item">
            <span class="rm-label">🎯 เกณฑ์คะแนน</span>
            <strong class="rm-val">{{ quiz()!.passingScorePercent }}%</strong>
          </div>
          <div class="rm-item">
            <span class="rm-label">📅 วันที่ประเมิน</span>
            <strong class="rm-val">{{ formatDate(currentAttempt()?.submittedAt || '') }}</strong>
          </div>
        </div>

        <!-- Result Actions -->
        <div class="result-actions">
          <button type="button" class="btn-res-action btn-review" (click)="openReviewMode(currentAttempt()!)">
            🧐 ตรวจดูเฉลยและคำอธิบายละเอียด
          </button>
          <button type="button" class="btn-res-action btn-retake" (click)="retakeQuiz()">
            🔄 ทำแบบทดสอบใหม่อีกครั้ง
          </button>
          <a [routerLink]="['/courses', course()?.slug || course()?.id, 'learn']" class="btn-res-action btn-classroom">
            ▶ กลับไปยังห้องเรียน
          </a>
        </div>
      </div>

      <!-- ================= 4. REVIEW & EXPLANATIONS SCREEN ================= -->
      <div class="review-view" *ngIf="mode() === 'review'">
        <div class="review-topbar">
          <div class="review-topbar-left">
            <button type="button" class="btn-back-result" (click)="mode.set('result')">
              ← กลับหน้าสรุปผล
            </button>
            <div class="review-header-title">
              <h2>เฉลยข้อสอบ: {{ quiz()!.thaiTitle || quiz()!.title }}</h2>
              <span class="review-score-tag" [class.passed]="currentAttempt()?.isPassed">
                คะแนน: {{ currentAttempt()?.percent }}% ({{ currentAttempt()?.score }}/{{ currentAttempt()?.maxScore }})
              </span>
            </div>
          </div>
          <div class="review-topbar-right">
            <button type="button" class="btn-retake-header" (click)="retakeQuiz()">
              🔄 สอบใหม่
            </button>
          </div>
        </div>

        <div class="review-list">
          <div
            *ngFor="let q of quiz()!.questions; let qIdx = index"
            class="review-card"
            [class.correct]="isQuestionCorrect(q, currentAttempt()!)"
            [class.wrong]="!isQuestionCorrect(q, currentAttempt()!)"
          >
            <!-- Card Header -->
            <div class="review-card-header">
              <div class="review-header-left">
                <span
                  class="verdict-badge"
                  [class.correct]="isQuestionCorrect(q, currentAttempt()!)"
                >
                  {{ isQuestionCorrect(q, currentAttempt()!) ? '✓ ตอบถูกต้อง' : '✕ ตอบไม่ถูกต้อง' }}
                </span>
                <span class="review-q-num">ข้อที่ {{ qIdx + 1 }}</span>
              </div>
              <span class="review-points">
                {{ isQuestionCorrect(q, currentAttempt()!) ? q.points : 0 }} / {{ q.points }} คะแนน
              </span>
            </div>

            <!-- Question Text -->
            <h3 class="review-q-text">{{ q.text }}</h3>

            <!-- Code snippet -->
            <div class="q-code-snippet" *ngIf="q.codeSnippet">
              <pre><code>{{ q.codeSnippet }}</code></pre>
            </div>

            <!-- Options Review -->
            <div class="review-options">
              <div
                *ngFor="let opt of q.options"
                class="review-opt-item"
                [class.user-selected]="isUserSelected(q.id, opt.id, currentAttempt()!)"
                [class.is-correct-answer]="q.correctAnswerIds.includes(opt.id)"
                [class.is-wrong-selected]="isUserSelected(q.id, opt.id, currentAttempt()!) && !q.correctAnswerIds.includes(opt.id)"
              >
                <div class="review-opt-icon">
                  <span *ngIf="q.correctAnswerIds.includes(opt.id)" class="icon-correct">✓</span>
                  <span *ngIf="isUserSelected(q.id, opt.id, currentAttempt()!) && !q.correctAnswerIds.includes(opt.id)" class="icon-wrong">✕</span>
                  <span *ngIf="!q.correctAnswerIds.includes(opt.id) && !isUserSelected(q.id, opt.id, currentAttempt()!)" class="icon-neutral">○</span>
                </div>
                <div class="review-opt-label"><strong>{{ opt.label }}.</strong></div>
                <div class="review-opt-text">{{ opt.text }}</div>
                <div class="review-opt-tag">
                  <span *ngIf="q.correctAnswerIds.includes(opt.id)" class="tag-correct">คำตอบที่ถูกต้อง</span>
                  <span *ngIf="isUserSelected(q.id, opt.id, currentAttempt()!)" class="tag-user">คุณเลือกข้อนี้</span>
                </div>
              </div>
            </div>

            <!-- Detailed Explanation Box -->
            <div class="explanation-box">
              <div class="explanation-header">
                <span class="exp-icon">💡</span>
                <strong>คำอธิบายและเหตุผล (Explanation):</strong>
              </div>
              <p class="exp-text">{{ q.explanation }}</p>
            </div>
          </div>
        </div>

        <div class="review-bottom-actions">
          <button type="button" class="btn-res-action btn-retake" (click)="retakeQuiz()">
            🔄 ทำแบบทดสอบใหม่อีกครั้ง
          </button>
          <a [routerLink]="['/courses', course()?.slug || course()?.id, 'learn']" class="btn-res-action btn-classroom">
            ▶ กลับไปยังห้องเรียน
          </a>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="not-found-page">
        <div class="nf-box">
          <span class="nf-icon">📝</span>
          <h2>ไม่พบข้อมูลแบบทดสอบ</h2>
          <p>แบบทดสอบที่ระบุอาจไม่มีอยู่ในระบบ หรือรหัสไม่ถูกต้อง</p>
          <a routerLink="/courses" class="btn-back">← กลับไปยังคลังหลักสูตร</a>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    /* ========== ROOT CONTAINER ========== */
    .quiz-container {
      min-height: calc(100vh - 64px);
      background: var(--sic-color-bg, #f8fafc);
      padding: 32px 20px 64px;
      color: var(--sic-color-text, #1e293b);
      font-family: var(--sic-font-sans, 'Inter', system-ui, sans-serif);
    }

    /* Common Card Styles */
    .quiz-card {
      max-width: 880px;
      margin: 0 auto;
      background: var(--sic-color-surface, #ffffff);
      border-radius: 20px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      padding: 40px;
    }

    /* ================= 1. INTRO VIEW ================= */
    .breadcrumb-nav {
      margin-bottom: 16px;
    }
    .crumb-link {
      font-size: 0.88rem;
      color: var(--sic-color-primary, #00a887);
      text-decoration: none;
      font-weight: 600;
    }
    .crumb-link:hover { text-decoration: underline; }

    .badge-row {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }
    .quiz-badge {
      background: #ede9fe;
      color: #6d28d9;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
    }
    .xp-badge {
      background: #fef3c7;
      color: #92400e;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
    }

    .quiz-title {
      margin: 0 0 6px;
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--sic-color-text, #1e293b);
      line-height: 1.3;
    }
    .quiz-subtitle {
      margin: 0 0 16px;
      font-size: 0.95rem;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .quiz-desc {
      margin: 0 0 28px;
      font-size: 1rem;
      line-height: 1.6;
      color: var(--sic-color-text-secondary, #475569);
    }

    .intro-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .metric-item {
      background: var(--sic-color-bg, #f1f5f9);
      border-radius: 14px;
      padding: 20px 16px;
      text-align: center;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .metric-icon { font-size: 1.8rem; margin-bottom: 8px; }
    .metric-val {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--sic-color-text, #1e293b);
      margin-bottom: 4px;
    }
    .metric-label {
      font-size: 0.78rem;
      color: var(--sic-color-text-secondary, #64748b);
      font-weight: 600;
    }

    .intro-instructions {
      background: rgba(0, 168, 135, 0.04);
      border: 1px solid rgba(0, 168, 135, 0.18);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 32px;
    }
    .intro-instructions h3 {
      margin: 0 0 12px;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-primary, #00a887);
    }
    .intro-instructions ul {
      margin: 0;
      padding-left: 20px;
    }
    .intro-instructions li {
      font-size: 0.9rem;
      color: var(--sic-color-text-secondary, #475569);
      line-height: 1.7;
    }

    .latest-attempt-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      margin-bottom: 32px;
    }
    .latest-attempt-banner.passed {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .attempt-icon { font-size: 2rem; flex-shrink: 0; }
    .attempt-info { flex: 1; min-width: 0; }
    .attempt-title {
      font-size: 0.92rem;
      color: var(--sic-color-text, #1e293b);
      margin-bottom: 4px;
    }
    .attempt-status { font-weight: 700; }
    .latest-attempt-banner.passed .attempt-status { color: #059669; }
    .latest-attempt-banner:not(.passed) .attempt-status { color: #dc2626; }
    .attempt-date {
      font-size: 0.78rem;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .btn-review-past {
      padding: 8px 16px;
      background: var(--sic-color-surface, #ffffff);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .btn-review-past:hover {
      border-color: var(--sic-color-primary, #00a887);
      color: var(--sic-color-primary, #00a887);
    }

    .intro-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      justify-content: center;
    }
    .btn-start-exam {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 36px;
      background: linear-gradient(135deg, #00a887, #10b981);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 168, 135, 0.3);
      transition: all 0.15s;
    }
    .btn-start-exam:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 168, 135, 0.4);
    }
    .btn-back-learn {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--sic-color-text-secondary, #64748b);
      text-decoration: none;
      padding: 14px 24px;
    }
    .btn-back-learn:hover { color: var(--sic-color-primary, #00a887); }

    /* ================= 2. TAKING SCREEN ================= */
    .taking-view {
      max-width: 1280px;
      margin: 0 auto;
    }

    .taking-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: var(--sic-color-surface, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 16px;
      padding: 12px 24px;
      margin-bottom: 24px;
      position: sticky;
      top: 16px;
      z-index: 30;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }
    .btn-exit {
      background: var(--sic-color-bg, #f1f5f9);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--sic-color-text-secondary, #64748b);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .btn-exit:hover { color: #ef4444; border-color: #ef4444; }
    .topbar-quiz-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .topbar-quiz-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .topbar-progress-count {
      font-size: 0.78rem;
      color: var(--sic-color-text-secondary, #64748b);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .timer-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
      padding: 6px 14px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      font-variant-numeric: tabular-nums;
    }
    .timer-badge.warning {
      background: #fef3c7;
      border-color: #fde047;
      color: #854d0e;
      animation: pulse 1.5s infinite;
    }
    .timer-badge.critical {
      background: #fef2f2;
      border-color: #fca5a5;
      color: #991b1b;
      animation: pulse 0.8s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.03); }
    }

    .btn-submit-header {
      padding: 8px 18px;
      background: linear-gradient(135deg, #00a887, #10b981);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-submit-header:hover { opacity: 0.9; }

    /* Taking Layout Grid */
    .taking-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      align-items: start;
    }

    /* Left: Navigator */
    .question-navigator {
      position: sticky;
      top: 96px;
    }
    .nav-card {
      background: var(--sic-color-surface, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.02);
    }
    .nav-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .nav-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
    }
    .nav-stat {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sic-color-primary, #00a887);
    }

    .nav-legend {
      display: flex;
      gap: 12px;
      font-size: 0.72rem;
      color: var(--sic-color-text-secondary, #64748b);
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .legend-item { display: flex; align-items: center; gap: 4px; }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot.answered { background: var(--sic-color-primary, #00a887); }
    .dot.unanswered { background: #e2e8f0; }
    .dot.flagged { background: #f59e0b; }

    .nav-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }
    .nav-btn {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-bg, #f8fafc);
      color: var(--sic-color-text, #1e293b);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .nav-btn:hover {
      border-color: var(--sic-color-primary, #00a887);
    }
    .nav-btn.answered {
      background: rgba(0, 168, 135, 0.12);
      border-color: var(--sic-color-primary, #00a887);
      color: var(--sic-color-primary, #00a887);
    }
    .nav-btn.current {
      border: 2px solid var(--sic-color-primary, #00a887);
      background: var(--sic-color-primary, #00a887);
      color: #fff;
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0, 168, 135, 0.3);
    }
    .flag-icon {
      position: absolute;
      top: -4px;
      right: -4px;
      font-size: 0.65rem;
    }

    .btn-nav-submit {
      width: 100%;
      padding: 10px;
      background: linear-gradient(135deg, #00a887, #10b981);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-nav-submit:hover { opacity: 0.9; }

    /* Right: Question Card */
    .question-card {
      background: var(--sic-color-surface, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }

    .q-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      flex-wrap: wrap;
    }
    .q-index-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .q-index-badge {
      background: var(--sic-color-bg, #f1f5f9);
      color: var(--sic-color-text, #1e293b);
      font-size: 0.82rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .q-type-badge {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .type-single_choice { background: #dbeafe; color: #1e40af; }
    .type-multi_choice { background: #ede9fe; color: #6d28d9; }
    .type-true_false { background: #fce7f3; color: #9d174d; }

    .q-points-badge {
      background: #fef3c7;
      color: #92400e;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .btn-flag-toggle {
      background: var(--sic-color-bg, #f8fafc);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .btn-flag-toggle:hover { border-color: #f59e0b; color: #f59e0b; }
    .btn-flag-toggle.active {
      background: #fef3c7;
      border-color: #f59e0b;
      color: #b45309;
    }

    .q-content { margin-bottom: 28px; }
    .q-text {
      margin: 0 0 16px;
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.5;
      color: var(--sic-color-text, #1e293b);
    }

    .q-code-snippet {
      background: #0f172a;
      border-radius: 12px;
      overflow: hidden;
      margin: 16px 0;
    }
    .code-bar {
      background: #1e293b;
      padding: 6px 14px;
      font-size: 0.75rem;
      color: #94a3b8;
      font-family: monospace;
    }
    .q-code-snippet pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
    }
    .q-code-snippet code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.88rem;
      color: #38bdf8;
      line-height: 1.6;
    }

    /* Options */
    .q-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }
    .option-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      background: var(--sic-color-bg, #f8fafc);
      border: 1.5px solid var(--sic-color-border, #e2e8f0);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .option-item:hover {
      border-color: var(--sic-color-primary, #00a887);
      background: rgba(0, 168, 135, 0.03);
    }
    .option-item.selected {
      border-color: var(--sic-color-primary, #00a887);
      background: rgba(0, 168, 135, 0.08);
      box-shadow: 0 0 0 1px var(--sic-color-primary, #00a887);
    }
    .option-control {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .custom-check-box {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--sic-color-border, #cbd5e1);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--sic-color-surface, #ffffff);
      transition: all 0.15s;
    }
    .custom-check-box.multi {
      border-radius: 6px;
    }
    .custom-check-box.checked {
      background: var(--sic-color-primary, #00a887);
      border-color: var(--sic-color-primary, #00a887);
    }
    .check-mark {
      color: #fff;
      font-size: 0.75rem;
      font-weight: 900;
      line-height: 1;
    }
    .option-label-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      font-size: 0.78rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .option-item.selected .option-label-circle {
      background: var(--sic-color-primary, #00a887);
      color: #fff;
    }
    .option-text {
      flex: 1;
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--sic-color-text, #1e293b);
    }

    /* Question Footer */
    .q-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-top: 20px;
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .btn-q-nav {
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-q-prev {
      background: var(--sic-color-surface, #ffffff);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      color: var(--sic-color-text, #1e293b);
    }
    .btn-q-prev:hover:not(:disabled) {
      border-color: var(--sic-color-primary, #00a887);
      color: var(--sic-color-primary, #00a887);
    }
    .btn-q-prev:disabled { opacity: 0.4; cursor: not-allowed; }

    .q-footer-right { display: flex; gap: 10px; }
    .btn-q-next {
      background: var(--sic-color-primary, #00a887);
      color: #fff;
      border: none;
    }
    .btn-q-next:hover { background: #009478; }

    .btn-q-finish {
      background: linear-gradient(135deg, #059669, #10b981);
      color: #fff;
      border: none;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .btn-q-finish:hover { transform: translateY(-1px); }

    /* Modal Submit Confirmation */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
    }
    .modal-card {
      background: var(--sic-color-surface, #ffffff);
      border-radius: 20px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalPop {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .modal-icon { font-size: 3rem; margin-bottom: 12px; }
    .modal-card h3 {
      margin: 0 0 8px;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
    }
    .modal-desc {
      margin: 0 0 16px;
      font-size: 0.92rem;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .modal-warn {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 20px;
      text-align: left;
    }
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn-cancel {
      padding: 10px 20px;
      background: var(--sic-color-bg, #f1f5f9);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-confirm-submit {
      padding: 10px 24px;
      background: linear-gradient(135deg, #00a887, #10b981);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }

    /* ================= 3. RESULT VIEW ================= */
    .result-card { text-align: center; }
    .result-hero {
      padding: 32px 20px 24px;
      border-radius: 16px;
      margin-bottom: 28px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(248, 113, 113, 0.08));
    }
    .result-hero.passed {
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.06), rgba(16, 185, 129, 0.1));
    }
    .result-hero-icon { font-size: 4.5rem; margin-bottom: 12px; }
    .result-hero-title {
      margin: 0 0 8px;
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--sic-color-text, #1e293b);
    }
    .result-hero-subtitle {
      margin: 0 0 24px;
      font-size: 0.95rem;
      color: var(--sic-color-text-secondary, #64748b);
    }

    .score-display-box {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 48px;
      background: var(--sic-color-surface, #ffffff);
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    }
    .score-percent {
      font-size: 3.5rem;
      font-weight: 900;
      color: var(--sic-color-primary, #00a887);
      line-height: 1;
      margin-bottom: 6px;
    }
    .result-hero:not(.passed) .score-percent { color: #ef4444; }
    .score-points {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--sic-color-text-secondary, #64748b);
      margin-bottom: 12px;
    }
    .score-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      background: #fee2e2;
      color: #991b1b;
    }
    .score-badge.pass {
      background: #dcfce7;
      color: #15803d;
    }

    .result-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .rm-item {
      background: var(--sic-color-bg, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }
    .rm-label {
      display: block;
      font-size: 0.78rem;
      color: var(--sic-color-text-secondary, #64748b);
      margin-bottom: 4px;
    }
    .rm-val {
      font-size: 1.05rem;
      color: var(--sic-color-text, #1e293b);
    }

    .result-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-res-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-review {
      background: #ede9fe;
      color: #6d28d9;
      border: 1px solid #ddd6fe;
    }
    .btn-review:hover { background: #ddd6fe; }
    .btn-retake {
      background: var(--sic-color-bg, #f1f5f9);
      color: var(--sic-color-text, #1e293b);
      border: 1px solid var(--sic-color-border, #cbd5e1);
    }
    .btn-retake:hover { border-color: var(--sic-color-primary, #00a887); }
    .btn-classroom {
      background: linear-gradient(135deg, #00a887, #10b981);
      color: #fff;
      border: none;
    }
    .btn-classroom:hover { opacity: 0.9; }

    /* ================= 4. REVIEW VIEW ================= */
    .review-view {
      max-width: 920px;
      margin: 0 auto;
    }
    .review-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      background: var(--sic-color-surface, #ffffff);
      padding: 16px 24px;
      border-radius: 16px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .review-topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .btn-back-result {
      padding: 6px 14px;
      background: var(--sic-color-bg, #f1f5f9);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }
    .review-header-title h2 {
      margin: 0 0 2px;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
    }
    .review-score-tag {
      font-size: 0.8rem;
      font-weight: 700;
      color: #dc2626;
    }
    .review-score-tag.passed { color: #059669; }

    .btn-retake-header {
      padding: 8px 16px;
      background: var(--sic-color-primary, #00a887);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
    }

    .review-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;
    }
    .review-card {
      background: var(--sic-color-surface, #ffffff);
      border-radius: 16px;
      border: 1.5px solid var(--sic-color-border, #e2e8f0);
      padding: 28px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.02);
    }
    .review-card.correct { border-left: 6px solid #10b981; }
    .review-card.wrong { border-left: 6px solid #ef4444; }

    .review-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .review-header-left { display: flex; align-items: center; gap: 10px; }
    .verdict-badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      background: #fee2e2;
      color: #991b1b;
    }
    .verdict-badge.correct {
      background: #dcfce7;
      color: #15803d;
    }
    .review-q-num {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--sic-color-text-secondary, #64748b);
    }
    .review-points {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
    }

    .review-q-text {
      margin: 0 0 16px;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sic-color-text, #1e293b);
    }

    .review-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    .review-opt-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-bg, #f8fafc);
      font-size: 0.9rem;
    }
    .review-opt-item.is-correct-answer {
      background: #ecfdf5;
      border-color: #86efac;
      color: #065f46;
      font-weight: 600;
    }
    .review-opt-item.is-wrong-selected {
      background: #fef2f2;
      border-color: #fca5a5;
      color: #991b1b;
    }
    .icon-correct { color: #059669; font-weight: 900; }
    .icon-wrong { color: #dc2626; font-weight: 900; }
    .icon-neutral { color: #cbd5e1; }

    .review-opt-text { flex: 1; }
    .review-opt-tag { display: flex; gap: 6px; }
    .tag-correct {
      font-size: 0.72rem;
      background: #10b981;
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
    }
    .tag-user {
      font-size: 0.72rem;
      background: #64748b;
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
    }

    /* Explanation Box */
    .explanation-box {
      background: rgba(0, 168, 135, 0.05);
      border: 1px dashed rgba(0, 168, 135, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
    }
    .explanation-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--sic-color-primary, #00a887);
      margin-bottom: 6px;
    }
    .exp-text {
      margin: 0;
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--sic-color-text-secondary, #334155);
    }

    .review-bottom-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 24px;
    }

    /* Not Found */
    .not-found-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }
    .nf-box {
      text-align: center;
      background: var(--sic-color-surface, #ffffff);
      padding: 48px;
      border-radius: 20px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }
    .nf-icon { font-size: 4rem; margin-bottom: 16px; }
    .btn-back {
      display: inline-block;
      margin-top: 16px;
      padding: 10px 20px;
      background: var(--sic-color-primary, #00a887);
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }

    /* ========== RESPONSIVE BREAKPOINTS ========== */
    @media (max-width: 1024px) {
      .intro-metrics { grid-template-columns: repeat(2, 1fr); }
      .taking-layout { grid-template-columns: 240px 1fr; }
      .result-metrics { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .quiz-container { padding: 16px 12px 48px; }
      .quiz-card { padding: 24px 18px; border-radius: 16px; }
      .taking-layout { grid-template-columns: 1fr; }
      .question-navigator { position: static; order: 2; margin-top: 20px; }
      .question-main { order: 1; }
      .question-card { padding: 20px 16px; }
      .taking-topbar { padding: 10px 14px; }
      .exit-text { display: none; }
      .intro-metrics { grid-template-columns: 1fr; }
      .result-metrics { grid-template-columns: 1fr; }
      .score-display-box { padding: 20px 30px; }
      .score-percent { font-size: 2.8rem; }
    }
  `],
})
export class QuizRunnerComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizService = inject(QuizService);
  private readonly coursesService = inject(CoursesService);

  readonly mode = signal<QuizMode>('intro');
  readonly quiz = signal<Quiz | undefined>(undefined);
  readonly course = signal<Course | undefined>(undefined);

  // Taking state
  readonly currentQuestionIndex = signal<number>(0);
  readonly answers = signal<Record<string, string[]>>({});
  readonly flaggedQuestionIds = signal<Set<string>>(new Set());
  readonly timeRemainingSeconds = signal<number>(0);
  readonly showSubmitDialog = signal<boolean>(false);
  readonly currentAttempt = signal<QuizAttempt | undefined>(undefined);

  private timerInterval: any = null;

  // Computed
  readonly totalPoints = computed(() => {
    const q = this.quiz();
    if (!q) return 0;
    return q.questions.reduce((sum, item) => sum + item.points, 0);
  });

  readonly currentQuestion = computed<QuizQuestion | undefined>(() => {
    const q = this.quiz();
    if (!q) return undefined;
    return q.questions[this.currentQuestionIndex()];
  });

  readonly answeredCount = computed(() => {
    const ans = this.answers();
    return Object.keys(ans).filter((k) => ans[k] && ans[k].length > 0).length;
  });

  readonly unansweredCount = computed(() => {
    const q = this.quiz();
    if (!q) return 0;
    return q.questions.length - this.answeredCount();
  });

  readonly latestAttempt = computed(() => {
    const q = this.quiz();
    if (!q) return undefined;
    return this.quizService.getLatestAttempt(q.id);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const courseId = params.get('id');
      const quizId = params.get('quizId');

      if (quizId) {
        const foundQuiz = this.quizService.getQuizById(quizId);
        this.quiz.set(foundQuiz);
      }

      if (courseId) {
        const foundCourse = this.coursesService.getCourseByIdOrSlug(courseId);
        this.course.set(foundCourse);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  startQuiz(): void {
    const q = this.quiz();
    if (!q) return;

    this.answers.set({});
    this.flaggedQuestionIds.set(new Set());
    this.currentQuestionIndex.set(0);
    this.mode.set('taking');

    if (q.timeLimitMinutes > 0) {
      this.timeRemainingSeconds.set(q.timeLimitMinutes * 60);
      this.startTimer();
    }
  }

  retakeQuiz(): void {
    this.startQuiz();
  }

  private startTimer(): void {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      const remaining = this.timeRemainingSeconds();
      if (remaining <= 1) {
        this.clearTimer();
        this.timeRemainingSeconds.set(0);
        this.autoSubmitDueToTimeout();
      } else {
        this.timeRemainingSeconds.set(remaining - 1);
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private autoSubmitDueToTimeout(): void {
    alert('⏱️ หมดเวลาในการทำแบบทดสอบ! ระบบจะส่งคำตอบโดยอัตโนมัติ');
    this.submitQuizConfirmed();
  }

  jumpToQuestion(idx: number): void {
    this.currentQuestionIndex.set(idx);
  }

  nextQuestion(): void {
    const q = this.quiz();
    if (!q) return;
    if (this.currentQuestionIndex() < q.questions.length - 1) {
      this.currentQuestionIndex.update((idx) => idx + 1);
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update((idx) => idx - 1);
    }
  }

  toggleFlag(qId: string): void {
    const flags = new Set(this.flaggedQuestionIds());
    if (flags.has(qId)) {
      flags.delete(qId);
    } else {
      flags.add(qId);
    }
    this.flaggedQuestionIds.set(flags);
  }

  isQuestionFlagged(qId: string): boolean {
    return this.flaggedQuestionIds().has(qId);
  }

  isQuestionAnswered(qId: string): boolean {
    const ans = this.answers()[qId];
    return !!ans && ans.length > 0;
  }

  isOptionSelected(qId: string, optId: string): boolean {
    const selected = this.answers()[qId] || [];
    return selected.includes(optId);
  }

  selectOption(question: QuizQuestion, optId: string): void {
    const current = this.answers();
    let updatedList: string[] = [];

    if (question.type === 'multi_choice') {
      const existing = current[question.id] || [];
      if (existing.includes(optId)) {
        updatedList = existing.filter((id) => id !== optId);
      } else {
        updatedList = [...existing, optId];
      }
    } else {
      // Single choice or True/False
      updatedList = [optId];
    }

    this.answers.set({
      ...current,
      [question.id]: updatedList,
    });
  }

  openSubmitDialog(): void {
    this.showSubmitDialog.set(true);
  }

  submitQuizConfirmed(): void {
    this.showSubmitDialog.set(false);
    this.clearTimer();

    const q = this.quiz();
    if (!q) return;

    const totalSeconds = q.timeLimitMinutes * 60;
    const spentSeconds = totalSeconds > 0 ? totalSeconds - this.timeRemainingSeconds() : 60;

    const attempt = this.quizService.submitQuiz(q.id, this.answers(), spentSeconds);
    this.currentAttempt.set(attempt);
    this.mode.set('result');
  }

  confirmExit(): void {
    if (confirm('คุณต้องการออกจากแบบทดสอบหรือไม่? ความคืบหน้าในรอบนี้จะไม่ถูกบันทึก')) {
      this.clearTimer();
      const course = this.course();
      if (course) {
        this.router.navigate(['/courses', course.slug || course.id, 'learn']);
      } else {
        this.router.navigate(['/courses']);
      }
    }
  }

  openReviewMode(attempt: QuizAttempt): void {
    this.currentAttempt.set(attempt);
    this.mode.set('review');
  }

  isQuestionCorrect(q: QuizQuestion, attempt: QuizAttempt): boolean {
    const selected = attempt.answers[q.id] || [];
    const correct = q.correctAnswerIds;
    return (
      selected.length === correct.length &&
      selected.every((id) => correct.includes(id))
    );
  }

  isUserSelected(qId: string, optId: string, attempt: QuizAttempt): boolean {
    const selected = attempt.answers[qId] || [];
    return selected.includes(optId);
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'single_choice': return 'ปรนัย (เลือก 1 คำตอบ)';
      case 'multi_choice': return 'ปรนัย (เลือกได้หลายคำตอบ)';
      case 'true_false': return 'ถูก / ผิด (True/False)';
      default: return type;
    }
  }

  formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  formatDate(isoString: string): string {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  }
}

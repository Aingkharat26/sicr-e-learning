import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { Course, CourseCategory, CourseLevel, CourseLesson, CourseModule } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-builder-stepper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="builder-container">
      <!-- Stepper Header Navigation -->
      <div class="stepper-header">
        <div class="step-indicator" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1" (click)="goToStep(1)">
          <span class="step-num">{{ currentStep() > 1 ? '✓' : '1' }}</span>
          <div class="step-label">
            <strong>1. ข้อมูลหลักสูตร</strong>
            <span>General Info</span>
          </div>
        </div>

        <div class="step-connector" [class.active]="currentStep() > 1"></div>

        <div class="step-indicator" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2" (click)="goToStep(2)">
          <span class="step-num">{{ currentStep() > 2 ? '✓' : '2' }}</span>
          <div class="step-label">
            <strong>2. โครงสร้างบทเรียน</strong>
            <span>Curriculum & Lessons</span>
          </div>
        </div>

        <div class="step-connector" [class.active]="currentStep() > 2"></div>

        <div class="step-indicator" [class.active]="currentStep() === 3" [class.completed]="currentStep() > 3" (click)="goToStep(3)">
          <span class="step-num">{{ currentStep() > 3 ? '✓' : '3' }}</span>
          <div class="step-label">
            <strong>3. ออกแบบข้อสอบ</strong>
            <span>Assessment & Quiz</span>
          </div>
        </div>

        <div class="step-connector" [class.active]="currentStep() > 3"></div>

        <div class="step-indicator" [class.active]="currentStep() === 4" (click)="goToStep(4)">
          <span class="step-num">4</span>
          <div class="step-label">
            <strong>4. ตรวจทาน & เผยแพร่</strong>
            <span>Review & Publish</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Course Info -->
      @if (currentStep() === 1) {
        <div class="step-content">
          <div class="section-intro">
            <h3>📝 ข้อมูลพื้นฐานและรายละเอียดหลักสูตร</h3>
            <p>กรอกข้อมูลสำคัญเพื่อแนะนำหลักสูตร กำหนดหมวดหมู่ และระดับความยากสำหรับผู้เรียน</p>
          </div>

          <div class="form-grid">
            <div class="form-group full">
              <label class="required">ชื่อหลักสูตร (ภาษาอังกฤษ / Title)</label>
              <input type="text" [(ngModel)]="courseForm.title" placeholder="เช่น Building Fullstack Angular 22 & Microservices" />
            </div>

            <div class="form-group full">
              <label>ชื่อหลักสูตรภาษาไทย (Thai Title)</label>
              <input type="text" [(ngModel)]="courseForm.thaiTitle" placeholder="เช่น พัฒนาเว็บแอปพลิเคชัน Angular 22 และสถาปัตยกรรม Microservices" />
            </div>

            <div class="form-group">
              <label class="required">หมวดหมู่ (Category)</label>
              <select [(ngModel)]="courseForm.category">
                <option value="Software Engineering">💻 Software Engineering</option>
                <option value="AI & Data">🧠 AI & Data</option>
                <option value="DevOps & Cloud">☁️ DevOps & Cloud</option>
                <option value="QA & Testing">🧪 QA & Testing</option>
                <option value="HR & Onboarding">🏢 HR & Onboarding</option>
                <option value="Management">💼 Management</option>
              </select>
            </div>

            <div class="form-group">
              <label class="required">ระดับความยาก (Level)</label>
              <select [(ngModel)]="courseForm.level">
                <option value="Beginner">🟢 ระดับเริ่มต้น (Beginner)</option>
                <option value="Intermediate">🟡 ระดับกลาง (Intermediate)</option>
                <option value="Advanced">🔴 ระดับสูง (Advanced)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="required">แต้ม XP รางวัล (XP Award)</label>
              <input type="number" [(ngModel)]="courseForm.xpAward" min="100" max="5000" step="50" />
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="courseForm.isMandatory" />
                <span>🚨 กำหนดเป็น<strong>หลักสูตรบังคับ (Mandatory Course)</strong> สำหรับพนักงาน</span>
              </label>
            </div>

            <div class="form-group full">
              <label class="required">คำอธิบายสรุปสั้น (Short Summary)</label>
              <input type="text" [(ngModel)]="courseForm.shortDescription" placeholder="สรุปใจความสำคัญของหลักสูตรใน 1-2 ประโยค" />
            </div>

            <div class="form-group full">
              <label class="required">คำอธิบายหลักสูตรฉบับเต็ม (Full Description)</label>
              <textarea rows="4" [(ngModel)]="courseForm.description" placeholder="ระบุเนื้อหาภาพรวม วัตถุประสงค์ และประโยชน์ที่จะได้รับ..."></textarea>
            </div>

            <div class="form-group full">
              <label>แท็กคำสำคัญ (Tags - คั่นด้วยเครื่องหมายจุลภาค)</label>
              <input type="text" [(ngModel)]="tagsInput" placeholder="เช่น Angular, TypeScript, Signals, Best Practices" />
            </div>

            <div class="form-group full">
              <label>ภาพปกหลักสูตร (Cover Thumbnail)</label>
              <div class="preset-thumbnails">
                @for (preset of presetThumbnails; track preset.url) {
                  <div
                    class="thumbnail-option"
                    [class.selected]="courseForm.thumbnail === preset.url"
                    (click)="courseForm.thumbnail = preset.url"
                  >
                    <img [src]="preset.url" [alt]="preset.label" />
                    <span>{{ preset.label }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="step-actions">
            <div></div>
            <button class="btn primary-btn" [disabled]="!isStep1Valid()" (click)="nextStep()">
              ถัดไป: โครงสร้างบทเรียน ➔
            </button>
          </div>
        </div>
      }

      <!-- Step 2: Curriculum Builder -->
      @if (currentStep() === 2) {
        <div class="step-content">
          <div class="section-intro">
            <div class="intro-header">
              <div>
                <h3>📚 โครงสร้างเนื้อหาและบทเรียน (Modules & Lessons)</h3>
                <p>สร้างโมดูลการเรียนรู้ และเพิ่มบทเรียนวิดีโอ เอกสารประกอบ หรือแบบทดสอบ</p>
              </div>
              <button class="btn secondary-btn" (click)="addModule()">
                ➕ เพิ่มโมดูลใหม่
              </button>
            </div>
          </div>

          <div class="modules-builder-list">
            @for (mod of courseForm.modules; track mod.id; let modIdx = $index) {
              <div class="module-card">
                <div class="module-card-header">
                  <div class="module-title-edit">
                    <span class="mod-badge">โมดูล {{ modIdx + 1 }}</span>
                    <input type="text" [(ngModel)]="mod.title" placeholder="ชื่อโมดูลการเรียนรู้..." />
                  </div>
                  @if ((courseForm.modules?.length || 0) > 1) {
                    <button class="icon-btn delete-btn" (click)="removeModule(modIdx)" title="ลบโมดูลนี้">
                      🗑️
                    </button>
                  }
                </div>

                <div class="module-lessons-container">
                  <div class="lessons-header">
                    <span>รายการบทเรียนในโมดูลนี้ ({{ mod.lessons.length }} บทเรียน)</span>
                    <div class="lesson-add-btns">
                      <button class="mini-btn" (click)="addLesson(mod, 'video')">🎥 + วิดีโอ</button>
                      <button class="mini-btn" (click)="addLesson(mod, 'article')">📄 + บทความ</button>
                      <button class="mini-btn" (click)="addLesson(mod, 'quiz')">📝 + แบบทดสอบ</button>
                    </div>
                  </div>

                  <div class="lessons-list">
                    @for (les of mod.lessons; track les.id; let lesIdx = $index) {
                      <div class="lesson-item-row">
                        <span class="lesson-type-icon">
                          @switch (les.type) {
                            @case ('video') { 🎥 }
                            @case ('article') { 📄 }
                            @case ('quiz') { 📝 }
                            @default { 📄 }
                          }
                        </span>
                        <div class="lesson-inputs">
                          <input type="text" class="lesson-title-input" [(ngModel)]="les.title" placeholder="ชื่อบทเรียน..." />
                          <input type="text" class="lesson-dur-input" [(ngModel)]="les.duration" placeholder="เช่น 20 นาที" />
                        </div>
                        <button class="mini-delete-btn" (click)="removeLesson(mod, lesIdx)" title="ลบบทเรียน">✕</button>
                      </div>
                    } @empty {
                      <div class="no-lessons">ยังไม่มีบทเรียนในโมดูลนี้ กรุณากดปุ่มด้านบนเพื่อเพิ่มบทเรียน</div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="step-actions">
            <button class="btn outline-btn" (click)="prevStep()">
              ⬅ ย้อนกลับ
            </button>
            <button class="btn primary-btn" (click)="nextStep()">
              ถัดไป: แบบทดสอบ & เกณฑ์ประเมิน ➔
            </button>
          </div>
        </div>
      }

      <!-- Step 3: Quiz Assessment Builder -->
      @if (currentStep() === 3) {
        <div class="step-content">
          <div class="section-intro">
            <div class="intro-header">
              <div>
                <h3>📝 แบบทดสอบวัดความเข้าใจ (Assessment & Quiz)</h3>
                <p>กำหนดเกณฑ์ผ่าน และออกข้อสอบเพื่อประเมินผู้เรียนก่อนออกใบประกาศนียบัตร</p>
              </div>
              <button class="btn secondary-btn" (click)="addQuestion()">
                ➕ เพิ่มคำถามข้อใหม่
              </button>
            </div>
          </div>

          <div class="quiz-config-bar">
            <div class="config-item">
              <label>🎯 เกณฑ์คะแนนสอบผ่าน (%)</label>
              <input type="number" [(ngModel)]="quizThreshold" min="50" max="100" step="5" />
            </div>
            <div class="config-item">
              <label>⏱️ เวลาที่ให้ทำข้อสอบ (นาที)</label>
              <input type="number" [(ngModel)]="quizTimeLimit" min="5" max="120" step="5" />
            </div>
          </div>

          <div class="questions-builder-list">
            @for (q of quizQuestions; track q.id; let qIdx = $index) {
              <div class="question-card">
                <div class="question-header">
                  <span class="q-badge">ข้อที่ {{ qIdx + 1 }}</span>
                  <input type="text" class="q-title-input" [(ngModel)]="q.text" placeholder="ระบุคำถาม..." />
                  @if (quizQuestions.length > 1) {
                    <button class="icon-btn delete-btn" (click)="removeQuestion(qIdx)" title="ลบคำถามข้อนี้">
                      🗑️
                    </button>
                  }
                </div>

                <div class="options-builder">
                  <label class="sub-label">ตัวเลือกคำตอบ (ทำเครื่องหมายที่ปุ่มวงกลมเพื่อระบุคำตอบที่ถูกต้อง):</label>
                  @for (opt of q.options; track opt.id; let optIdx = $index) {
                    <div class="option-row">
                      <input
                        type="radio"
                        [name]="'correct_' + q.id"
                        [checked]="q.correctAnswer === opt.id"
                        (change)="q.correctAnswer = opt.id"
                      />
                      <span class="opt-letter">{{ ['A', 'B', 'C', 'D'][optIdx] }}.</span>
                      <input type="text" class="opt-text-input" [(ngModel)]="opt.text" placeholder="ข้อความตัวเลือก..." />
                    </div>
                  }
                </div>

                <div class="explanation-box">
                  <label class="sub-label">💡 คำอธิบายเฉลยละเอียด (Explanation):</label>
                  <input type="text" [(ngModel)]="q.explanation" placeholder="อธิบายเหตุผลว่าทำไมข้อนี้ถึงถูกต้อง..." />
                </div>
              </div>
            }
          </div>

          <div class="step-actions">
            <button class="btn outline-btn" (click)="prevStep()">
              ⬅ ย้อนกลับ
            </button>
            <button class="btn primary-btn" (click)="nextStep()">
              ถัดไป: ตรวจทาน & เผยแพร่ ➔
            </button>
          </div>
        </div>
      }

      <!-- Step 4: Review & Publish -->
      @if (currentStep() === 4) {
        <div class="step-content">
          <div class="section-intro">
            <h3>👁️ ตรวจทานข้อมูลหลักสูตรก่อนเผยแพร่</h3>
            <p>ตรวจสอบรายละเอียดหลักสูตร โครงสร้างบทเรียน และแบบทดสอบก่อนบันทึกเข้าระบบ</p>
          </div>

          <div class="review-grid">
            <!-- Preview Card -->
            <div class="preview-card">
              <div class="preview-img-wrap">
                <img [src]="courseForm.thumbnail" [alt]="courseForm.title" />
                <span class="preview-cat-badge">{{ courseForm.category }}</span>
                @if (courseForm.isMandatory) {
                  <span class="preview-mand-badge">คอร์สบังคับ</span>
                }
              </div>
              <div class="preview-body">
                <h4 class="preview-title">{{ courseForm.title || 'ชื่อหลักสูตรตัวอย่าง' }}</h4>
                @if (courseForm.thaiTitle) {
                  <p class="preview-thai">{{ courseForm.thaiTitle }}</p>
                }
                <p class="preview-desc">{{ courseForm.shortDescription || 'คำอธิบายสรุป...' }}</p>
                
                <div class="preview-meta-row">
                  <span>📊 ระดับ: {{ courseForm.level }}</span>
                  <span>💎 {{ courseForm.xpAward }} XP</span>
                </div>

                <div class="preview-instructor">
                  <img [src]="currentInstructorAvatar" [alt]="currentInstructorName" />
                  <div>
                    <strong>{{ currentInstructorName }}</strong>
                    <span>ผู้สอน / Instructor</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary Details Card -->
            <div class="summary-details-card">
              <h4>📋 สรุปองค์ประกอบหลักสูตร</h4>
              <ul class="summary-list">
                <li>
                  <span>📁 จำนวนโมดูล:</span>
                  <strong>{{ courseForm.modules?.length || 0 }} โมดูล</strong>
                </li>
                <li>
                  <span>📚 จำนวนบทเรียนรวม:</span>
                  <strong>{{ totalLessonsCount() }} บทเรียน</strong>
                </li>
                <li>
                  <span>⏱️ ระยะเวลารวมโดยประมาณ:</span>
                  <strong>{{ calculatedDuration() }}</strong>
                </li>
                <li>
                  <span>📝 แบบทดสอบประเมินผล:</span>
                  <strong>{{ quizQuestions.length }} ข้อ (เกณฑ์ผ่าน {{ quizThreshold }}%)</strong>
                </li>
                <li>
                  <span>📜 ใบประกาศนียบัตรดิจิทัล:</span>
                  <strong class="cert-yes">✅ พร้อมออกใบรับรองอัตโนมัติ</strong>
                </li>
              </ul>

              <div class="publish-notice">
                <span class="notice-icon">💡</span>
                <p>เมื่อกดเผยแพร่ หลักสูตรจะถูกเพิ่มเข้าสู่ <strong>Course Catalog</strong> โดยอัตโนมัติ และพนักงานทุกคนในองค์กรจะสามารถค้นหาและลงทะเบียนเรียนได้ทันที!</p>
              </div>

              <div class="publish-buttons">
                <button class="btn draft-btn" (click)="publishCourse('draft')">
                  💾 บันทึกเป็นแบบร่าง (Draft)
                </button>
                <button class="btn publish-now-btn" (click)="publishCourse('published')">
                  🚀 เผยแพร่หลักสูตรทันที (Publish to Catalog)
                </button>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button class="btn outline-btn" (click)="prevStep()">
              ⬅ ย้อนกลับไปแก้ไข
            </button>
          </div>
        </div>
      }

      <!-- Floating Success Toast -->
      @if (successToast()) {
        <div class="floating-toast">
          {{ successToast() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .builder-container {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Stepper Navigation */
    .stepper-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      padding-bottom: 1.5rem;
      overflow-x: auto;
      gap: 0.5rem;
    }

    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      opacity: 0.5;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        opacity: 0.8;
      }

      &.active {
        opacity: 1;

        .step-num {
          background: #00a887;
          color: #ffffff;
          box-shadow: 0 0 0 4px rgba(0, 168, 135, 0.2);
        }

        .step-label strong {
          color: #00a887;
        }
      }

      &.completed {
        opacity: 1;

        .step-num {
          background: #10b981;
          color: #ffffff;
        }
      }
    }

    .step-num {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--sic-color-surface-hover, #f1f5f9);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      color: var(--sic-color-text-muted, #64748b);
      flex-shrink: 0;
    }

    .step-label {
      display: flex;
      flex-direction: column;

      strong {
        font-size: 0.85rem;
        color: var(--sic-color-text-active, #0f172a);
      }

      span {
        font-size: 0.72rem;
        color: var(--sic-color-text-muted, #94a3b8);
      }
    }

    .step-connector {
      flex: 1;
      height: 2px;
      background: var(--sic-color-border, #e2e8f0);
      min-width: 20px;
      margin: 0 0.5rem;

      &.active {
        background: #10b981;
      }
    }

    /* Section Intro */
    .section-intro {
      margin-bottom: 1.5rem;

      .intro-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      h3 {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--sic-color-text-active, #0f172a);
        margin: 0 0 0.25rem 0;
      }

      p {
        font-size: 0.88rem;
        color: var(--sic-color-text-muted, #64748b);
        margin: 0;
      }
    }

    /* Form Layout */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      &.full {
        grid-column: 1 / -1;
      }

      label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--sic-color-text-active, #0f172a);

        &.required::after {
          content: ' *';
          color: #ef4444;
        }
      }

      input[type="text"],
      input[type="number"],
      select,
      textarea {
        width: 100%;
        padding: 0.7rem 1rem;
        border-radius: 10px;
        border: 1px solid var(--sic-color-border, #cbd5e1);
        background: var(--sic-color-surface-hover, #f8fafc);
        font-size: 0.88rem;
        color: var(--sic-color-text-active, #0f172a);
        outline: none;
        box-sizing: border-box;
        transition: all 0.2s ease;

        &:focus {
          border-color: #00a887;
          background: var(--sic-color-bg, #ffffff);
          box-shadow: 0 0 0 3px rgba(0, 168, 135, 0.1);
        }
      }
    }

    .checkbox-group {
      justify-content: center;

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.88rem;
        cursor: pointer;

        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #00a887;
        }
      }
    }

    .preset-thumbnails {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.75rem;
    }

    .thumbnail-option {
      border: 2px solid var(--sic-color-border, #e2e8f0);
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;

      img {
        width: 100%;
        height: 70px;
        object-fit: cover;
      }

      span {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.35rem;
        text-align: center;
        background: var(--sic-color-surface-hover, #f8fafc);
        color: var(--sic-color-text-active, #0f172a);
      }

      &.selected {
        border-color: #00a887;
        box-shadow: 0 0 0 3px rgba(0, 168, 135, 0.2);
      }
    }

    /* Step 2 Modules Builder */
    .modules-builder-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .module-card {
      background: var(--sic-color-surface-hover, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .module-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      .module-title-edit {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;

        .mod-badge {
          font-size: 0.75rem;
          font-weight: 800;
          background: #00a887;
          color: #ffffff;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          white-space: nowrap;
        }

        input {
          flex: 1;
          padding: 0.55rem 0.85rem;
          border-radius: 8px;
          border: 1px solid var(--sic-color-border, #cbd5e1);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--sic-color-text-active, #0f172a);
          background: var(--sic-color-bg, #ffffff);
        }
      }
    }

    .module-lessons-container {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 10px;
      padding: 1rem;
    }

    .lessons-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .lesson-add-btns {
      display: flex;
      gap: 0.4rem;
    }

    .mini-btn {
      padding: 0.25rem 0.55rem;
      font-size: 0.72rem;
      font-weight: 700;
      border-radius: 6px;
      border: 1px solid var(--sic-color-border, #cbd5e1);
      background: var(--sic-color-surface-hover, #f8fafc);
      color: var(--sic-color-text-active, #0f172a);
      cursor: pointer;

      &:hover {
        background: rgba(0, 168, 135, 0.1);
        color: #00a887;
        border-color: #00a887;
      }
    }

    .lessons-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .lesson-item-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.5rem;
      background: var(--sic-color-surface-hover, #f8fafc);
      border-radius: 8px;
      border: 1px solid var(--sic-color-border, #e2e8f0);

      .lesson-type-icon { font-size: 1.1rem; }

      .lesson-inputs {
        display: flex;
        gap: 0.5rem;
        flex: 1;

        .lesson-title-input {
          flex: 3;
          padding: 0.4rem 0.65rem;
          border-radius: 6px;
          border: 1px solid var(--sic-color-border, #cbd5e1);
          font-size: 0.82rem;
          background: var(--sic-color-bg, #ffffff);
          color: var(--sic-color-text-active, #0f172a);
        }

        .lesson-dur-input {
          flex: 1;
          max-width: 100px;
          padding: 0.4rem 0.65rem;
          border-radius: 6px;
          border: 1px solid var(--sic-color-border, #cbd5e1);
          font-size: 0.82rem;
          background: var(--sic-color-bg, #ffffff);
          color: var(--sic-color-text-active, #0f172a);
        }
      }

      .mini-delete-btn {
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        font-weight: 800;
        padding: 0.2rem 0.4rem;
      }
    }

    .no-lessons {
      text-align: center;
      padding: 1.5rem;
      color: #94a3b8;
      font-size: 0.82rem;
    }

    /* Step 3 Quiz Builder */
    .quiz-config-bar {
      display: flex;
      gap: 1.5rem;
      background: var(--sic-color-surface-hover, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 1rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;

      .config-item {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--sic-color-text-active, #0f172a);
        }

        input {
          width: 80px;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          border: 1px solid var(--sic-color-border, #cbd5e1);
          font-weight: 700;
          background: var(--sic-color-bg, #ffffff);
          color: var(--sic-color-text-active, #0f172a);
        }
      }
    }

    .questions-builder-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .question-card {
      background: var(--sic-color-surface-hover, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .question-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .q-badge {
        font-size: 0.78rem;
        font-weight: 800;
        background: #7c3aed;
        color: #ffffff;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        white-space: nowrap;
      }

      .q-title-input {
        flex: 1;
        padding: 0.55rem 0.85rem;
        border-radius: 8px;
        border: 1px solid var(--sic-color-border, #cbd5e1);
        font-size: 0.9rem;
        font-weight: 700;
        background: var(--sic-color-bg, #ffffff);
        color: var(--sic-color-text-active, #0f172a);
      }
    }

    .sub-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
      display: block;
      margin-bottom: 0.4rem;
    }

    .options-builder {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      input[type="radio"] {
        width: 18px;
        height: 18px;
        accent-color: #10b981;
      }

      .opt-letter {
        font-weight: 800;
        font-size: 0.85rem;
        width: 20px;
      }

      .opt-text-input {
        flex: 1;
        padding: 0.45rem 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--sic-color-border, #cbd5e1);
        background: var(--sic-color-bg, #ffffff);
        color: var(--sic-color-text-active, #0f172a);
        font-size: 0.85rem;
      }
    }

    .explanation-box {
      input {
        width: 100%;
        padding: 0.45rem 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--sic-color-border, #cbd5e1);
        background: var(--sic-color-bg, #ffffff);
        color: var(--sic-color-text-active, #0f172a);
        font-size: 0.85rem;
        box-sizing: border-box;
      }
    }

    /* Step 4 Review & Publish */
    .review-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .preview-card {
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;

      .preview-img-wrap {
        position: relative;
        height: 180px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-cat-badge {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: rgba(0, 168, 135, 0.9);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
        }

        .preview-mand-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
        }
      }

      .preview-body {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;

        .preview-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--sic-color-text-active, #0f172a);
          margin: 0;
        }

        .preview-thai {
          font-size: 0.85rem;
          color: var(--sic-color-text-muted, #64748b);
          margin: 0;
        }

        .preview-desc {
          font-size: 0.82rem;
          color: var(--sic-color-text-muted, #64748b);
          line-height: 1.4;
          margin: 0;
        }

        .preview-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 700;
          color: #00a887;
          border-top: 1px solid var(--sic-color-border, #e2e8f0);
          padding-top: 0.6rem;
        }

        .preview-instructor {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-top: 0.5rem;

          img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
          }

          div {
            display: flex;
            flex-direction: column;

            strong {
              font-size: 0.82rem;
              color: var(--sic-color-text-active, #0f172a);
            }

            span {
              font-size: 0.72rem;
              color: #94a3b8;
            }
          }
        }
      }
    }

    .summary-details-card {
      background: var(--sic-color-surface-hover, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      h4 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--sic-color-text-active, #0f172a);
      }

      .summary-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        li {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          border-bottom: 1px dashed var(--sic-color-border, #cbd5e1);
          padding-bottom: 0.4rem;

          span { color: var(--sic-color-text-muted, #64748b); }
          strong { color: var(--sic-color-text-active, #0f172a); }
          strong.cert-yes { color: #059669; }
        }
      }

      .publish-notice {
        display: flex;
        gap: 0.65rem;
        background: rgba(0, 168, 135, 0.08);
        border: 1px solid rgba(0, 168, 135, 0.2);
        padding: 0.85rem;
        border-radius: 10px;

        .notice-icon { font-size: 1.2rem; }
        p {
          font-size: 0.82rem;
          color: #00a887;
          margin: 0;
          line-height: 1.4;
        }
      }

      .publish-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;

        .draft-btn {
          padding: 0.7rem;
          background: var(--sic-color-bg, #ffffff);
          border: 1px solid var(--sic-color-border, #cbd5e1);
          color: var(--sic-color-text-active, #0f172a);
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;

          &:hover { background: var(--sic-color-surface-hover, #f1f5f9); }
        }

        .publish-now-btn {
          padding: 0.85rem;
          background: linear-gradient(135deg, #00a887, #10b981);
          border: none;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.95rem;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 168, 135, 0.3);

          &:hover {
            opacity: 0.95;
            transform: translateY(-1px);
          }
        }
      }
    }

    /* Common Actions & Buttons */
    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      padding-top: 1.5rem;
    }

    .btn {
      padding: 0.65rem 1.4rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;

      &.primary-btn {
        background: #00a887;
        color: #ffffff;
        border: none;

        &:hover:not(:disabled) { background: #008f73; }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }

      &.secondary-btn {
        background: rgba(0, 168, 135, 0.1);
        color: #00a887;
        border: 1px solid rgba(0, 168, 135, 0.3);

        &:hover { background: #00a887; color: #ffffff; }
      }

      &.outline-btn {
        background: transparent;
        color: var(--sic-color-text-active, #0f172a);
        border: 1px solid var(--sic-color-border, #cbd5e1);

        &:hover { background: var(--sic-color-surface-hover, #f1f5f9); }
      }
    }

    .icon-btn {
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.3rem;
    }

    .floating-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #0f172a;
      color: #ffffff;
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: toastSlideUp 0.3s ease;
    }

    @keyframes toastSlideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .review-grid { grid-template-columns: 1fr; }
      .stepper-header { flex-direction: column; align-items: stretch; }
      .step-connector { display: none; }
    }
  `]
})
export class CourseBuilderStepperComponent {
  private readonly adminService = inject(AdminService);
  private readonly authState = inject(AuthStateService);

  readonly currentStep = signal<number>(1);
  readonly successToast = signal<string | null>(null);

  // Form State
  courseForm: Partial<Course> = {
    id: `crs-${Date.now().toString().slice(-4)}`,
    title: '',
    thaiTitle: '',
    slug: '',
    category: 'Software Engineering',
    level: 'Intermediate',
    duration: '4 ชม. 30 นาที',
    totalLessons: 6,
    xpAward: 1200,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    description: '',
    shortDescription: '',
    isMandatory: false,
    rating: 5.0,
    ratingCount: 1,
    totalEnrolled: 1,
    enrolledStatus: 'not_enrolled',
    userProgressPercent: 0,
    modules: [
      {
        id: 'mod-1',
        title: 'โมดูล 1: พื้นฐานและการเตรียมสภาพแวดล้อม',
        order: 1,
        description: 'บทนำและภาพรวมของหลักสูตร',
        lessons: [
          { id: 'les-01', title: '1.1 บทนำและเป้าหมายการเรียนรู้', duration: '20 นาที', type: 'video' },
          { id: 'les-02', title: '1.2 เอกสารประกอบและคู่มือมาตรฐานองค์กร', duration: '15 นาที', type: 'article' },
        ],
      },
    ],
  };

  tagsInput = 'Angular 22, Enterprise, Architecture, Soft Inter';

  // Quiz questions state
  quizThreshold = 80;
  quizTimeLimit = 20;
  quizQuestions = [
    {
      id: 'q-1',
      text: 'ข้อใดคือข้อดีหลักของการนำ Signals มาใช้ใน Angular 22?',
      options: [
        { id: 'opt-a', text: 'ทำงานแบบ Fine-grained Reactivity โดยไม่ต้องพึ่งพา Zone.js' },
        { id: 'opt-b', text: 'ทำให้เขียนโค้ดยาวขึ้น' },
        { id: 'opt-c', text: 'ใช้กับ AngularJS 1.x ได้' },
        { id: 'opt-d', text: 'บังคับให้ต้องเขียน Redux เสมอ' },
      ],
      correctAnswer: 'opt-a',
      explanation: 'Angular Signals มอบความสามารถ Fine-grained Reactivity ทำให้แอปพลิเคชันทำงานแบบ Zoneless ได้อย่างรวดเร็ว',
    },
    {
      id: 'q-2',
      text: 'สิทธิประโยชน์ Learning Budget ของพนักงาน Soft Inter Chiangrai ต่อปีคือเท่าใด?',
      options: [
        { id: 'opt-a', text: '5,000 บาท' },
        { id: 'opt-b', text: '20,000 บาท' },
        { id: 'opt-c', text: '50,000 บาท' },
        { id: 'opt-d', text: 'ไม่มีจำกัด' },
      ],
      correctAnswer: 'opt-b',
      explanation: 'บริษัทสนับสนุนงบประมาณการเรียนรู้และสอบใบเซอร์ 20,000 บาทต่อคนต่อปี',
    },
  ];

  presetThumbnails = [
    { label: 'Coding / Web', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80' },
    { label: 'AI & Data', url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80' },
    { label: 'Cloud & DevOps', url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80' },
    { label: 'Team & Culture', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80' },
    { label: 'QA & Testing', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80' },
  ];

  get currentInstructorName(): string {
    return this.authState.currentUser()?.thaiName || 'ดร. ศรัณย์กรณ์ พูลสวัสดิ์';
  }

  get currentInstructorAvatar(): string {
    return this.authState.currentUser()?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  }

  goToStep(step: number): void {
    if (step === 2 && !this.isStep1Valid()) return;
    this.currentStep.set(step);
  }

  nextStep(): void {
    this.currentStep.update((s) => Math.min(4, s + 1));
  }

  prevStep(): void {
    this.currentStep.update((s) => Math.max(1, s - 1));
  }

  isStep1Valid(): boolean {
    return !!(this.courseForm.title && this.courseForm.category && this.courseForm.shortDescription);
  }

  totalLessonsCount(): number {
    return (this.courseForm.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  }

  calculatedDuration(): string {
    const total = this.totalLessonsCount();
    const hours = Math.max(1, Math.round(total * 0.45));
    const mins = (total * 25) % 60;
    return `${hours} ชม. ${mins} นาที`;
  }

  // Module Management
  addModule(): void {
    const idx = (this.courseForm.modules?.length || 0) + 1;
    this.courseForm.modules?.push({
      id: `mod-${idx}`,
      title: `โมดูล ${idx}: หัวข้อเนื้อหาใหม่`,
      order: idx,
      lessons: [
        { id: `les-${idx}01`, title: `${idx}.1 แนะนำบทเรียน`, duration: '20 นาที', type: 'video' },
      ],
    });
  }

  removeModule(idx: number): void {
    this.courseForm.modules?.splice(idx, 1);
  }

  addLesson(mod: CourseModule, type: 'video' | 'article' | 'quiz'): void {
    const nextNum = mod.lessons.length + 1;
    mod.lessons.push({
      id: `les-${Date.now()}`,
      title: `บทเรียนใหม่ (${type === 'video' ? 'วิดีโอ' : type === 'quiz' ? 'แบบทดสอบ' : 'เอกสาร'})`,
      duration: '25 นาที',
      type,
    });
  }

  removeLesson(mod: CourseModule, lesIdx: number): void {
    mod.lessons.splice(lesIdx, 1);
  }

  // Question Management
  addQuestion(): void {
    const nextQ = this.quizQuestions.length + 1;
    this.quizQuestions.push({
      id: `q-${nextQ}`,
      text: `คำถามข้อที่ ${nextQ}...`,
      options: [
        { id: 'opt-a', text: 'ตัวเลือก A' },
        { id: 'opt-b', text: 'ตัวเลือก B' },
        { id: 'opt-c', text: 'ตัวเลือก C' },
        { id: 'opt-d', text: 'ตัวเลือก D' },
      ],
      correctAnswer: 'opt-a',
      explanation: 'คำอธิบายเพิ่มเติมสำหรับข้อนี้',
    });
  }

  removeQuestion(idx: number): void {
    this.quizQuestions.splice(idx, 1);
  }

  // Publish / Save
  publishCourse(status: 'published' | 'draft'): void {
    const rawTags = this.tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const slug = (this.courseForm.title || 'new-course')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const completeCourse: Course = {
      id: this.courseForm.id || `crs-${Date.now()}`,
      title: this.courseForm.title || 'หลักสูตรใหม่',
      thaiTitle: this.courseForm.thaiTitle || this.courseForm.title,
      slug: slug || `course-${Date.now()}`,
      category: this.courseForm.category as CourseCategory,
      level: this.courseForm.level as CourseLevel,
      duration: this.calculatedDuration(),
      totalLessons: this.totalLessonsCount(),
      xpAward: this.courseForm.xpAward || 1200,
      thumbnail: this.courseForm.thumbnail || this.presetThumbnails[0].url,
      description: this.courseForm.description || this.courseForm.shortDescription || '',
      shortDescription: this.courseForm.shortDescription || '',
      instructor: {
        id: this.authState.currentUser()?.id || 'usr-002',
        name: this.authState.currentUser()?.name || 'Dr. Sarankon P.',
        thaiName: this.currentInstructorName,
        avatar: this.currentInstructorAvatar,
        title: 'Lead Instructor & Specialist',
        department: this.authState.currentUser()?.department || 'Software Engineering',
        bio: 'ผู้เชี่ยวชาญประจำหลักสูตร',
        totalCourses: 4,
        totalStudents: 150,
        rating: 5.0,
      },
      rating: 5.0,
      ratingCount: 1,
      totalEnrolled: 1,
      isMandatory: this.courseForm.isMandatory || false,
      isFeatured: true,
      tags: rawTags.length ? rawTags : ['Angular', 'New Course'],
      enrolledStatus: 'not_enrolled',
      userProgressPercent: 0,
      language: 'ภาษาไทย',
      lastUpdated: 'สิงหาคม 2026',
      certificateAvailable: true,
      modules: this.courseForm.modules || [],
    };

    this.adminService.createNewCourse(completeCourse, status);

    const message = status === 'published'
      ? `🎉 เผยแพร่หลักสูตร "${completeCourse.title}" ขึ้นสู่ Course Catalog เรียบร้อยแล้ว!`
      : `💾 บันทึกร่างหลักสูตร "${completeCourse.title}" เรียบร้อยแล้ว`;

    this.showToast(message);
    this.currentStep.set(1);
  }

  private showToast(msg: string): void {
    this.successToast.set(msg);
    setTimeout(() => {
      this.successToast.set(null);
    }, 4500);
  }
}

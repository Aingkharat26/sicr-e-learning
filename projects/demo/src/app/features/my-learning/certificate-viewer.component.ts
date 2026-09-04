import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Certificate } from '../../core/models/certificate.model';

@Component({
  selector: 'app-certificate-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="certificate-modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-container">
        <!-- Action Toolbar (Hidden during Print) -->
        <div class="modal-toolbar no-print">
          <div class="toolbar-info">
            <span class="cert-badge">📜 ใบประกาศนียบัตรดิจิทัล</span>
            <span class="cert-num">{{ certificate.certificateNumber }}</span>
          </div>
          <div class="toolbar-actions">
            <button class="action-btn copy-btn" (click)="copyLink()">
              <span class="btn-icon">🔗</span>
              <span>{{ copied() ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์ตรวจสอบ' }}</span>
            </button>
            <button class="action-btn print-btn" (click)="printCertificate()">
              <span class="btn-icon">🖨️</span>
              <span>พิมพ์ / บันทึก PDF</span>
            </button>
            <button class="close-btn" (click)="close.emit()" title="ปิดหน้าต่าง">
              ✕
            </button>
          </div>
        </div>

        <!-- Certificate Frame Paper -->
        <div class="certificate-paper-wrapper">
          <div class="certificate-frame">
            <!-- Inner Border Ornaments -->
            <div class="corner-ornament top-left"></div>
            <div class="corner-ornament top-right"></div>
            <div class="corner-ornament bottom-left"></div>
            <div class="corner-ornament bottom-right"></div>

            <!-- Certificate Header -->
            <div class="cert-header">
              <div class="company-brand">
                <div class="brand-logo-badge">
                  <span class="logo-text">SICR</span>
                </div>
                <div class="company-text">
                  <h4 class="company-name">SOFT INTER CHIANGRAI</h4>
                  <p class="company-sub">ACADEMY & CONTINUOUS LEARNING CENTER</p>
                </div>
              </div>
              <div class="cert-badge-seal">
                <div class="seal-circle">
                  <span class="seal-star">★</span>
                  <span class="seal-text">VERIFIED</span>
                  <span class="seal-star">★</span>
                </div>
              </div>
            </div>

            <!-- Title -->
            <div class="cert-title-section">
              <h1 class="main-title">CERTIFICATE OF COMPLETION</h1>
              <p class="sub-title">ใบประกาศนียบัตรรับรองการสำเร็จหลักสูตร</p>
              <div class="decorative-divider">
                <span class="divider-line"></span>
                <span class="divider-diamond">✦</span>
                <span class="divider-line"></span>
              </div>
            </div>

            <!-- Recipient -->
            <div class="recipient-section">
              <p class="present-text">ขอมอบใบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</p>
              <h2 class="recipient-name">{{ certificate.recipientName }}</h2>
              <p class="recipient-role">{{ certificate.recipientRole }} • {{ certificate.recipientDepartment }}</p>
            </div>

            <!-- Course Info -->
            <div class="course-section">
              <p class="achievement-text">ได้ผ่านการอบรมและผ่านเกณฑ์การประเมินผลการเรียนรู้ในหลักสูตร</p>
              <h3 class="course-name">{{ certificate.courseTitle }}</h3>
              @if (certificate.courseThaiTitle) {
                <p class="course-thai-name">({{ certificate.courseThaiTitle }})</p>
              }
              <div class="skills-tags">
                @for (skill of certificate.skillsCovered; track skill) {
                  <span class="skill-tag">✓ {{ skill }}</span>
                }
              </div>
            </div>

            <!-- Certificate Footer (Signatures & Metadata) -->
            <div class="cert-footer">
              <!-- Left: Instructor Sign -->
              <div class="signature-block">
                <div class="signature-line">
                  <div class="script-signature">{{ certificate.instructorName }}</div>
                </div>
                <p class="signer-name">{{ certificate.instructorName }}</p>
                <p class="signer-title">{{ certificate.instructorTitle }}</p>
              </div>

              <!-- Center: Official Metadata & Seal -->
              <div class="cert-meta-center">
                <div class="qr-mock">
                  <div class="qr-pattern">
                    <span class="qr-icon">🔒</span>
                  </div>
                  <span class="qr-label">สแกนตรวจสอบสิทธิ์</span>
                </div>
                <div class="meta-details">
                  <p class="meta-date">วันที่ออกเอกสาร: <strong>{{ certificate.issueDate }}</strong></p>
                  <p class="meta-cert-no">รหัสรับรอง: <code>{{ certificate.certificateNumber }}</code></p>
                  <p class="meta-xp">คะแนนสอบประเมิน: <strong>{{ certificate.completionScorePercent }}%</strong> ({{ certificate.xpEarned }} XP)</p>
                </div>
              </div>

              <!-- Right: CEO Sign -->
              <div class="signature-block">
                <div class="signature-line">
                  <div class="script-signature ceo-sign">{{ certificate.ceoName }}</div>
                </div>
                <p class="signer-name">{{ certificate.ceoName }}</p>
                <p class="signer-title">{{ certificate.ceoTitle }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .certificate-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow-y: auto;
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-container {
      width: 100%;
      max-width: 1000px;
      margin: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Modal Toolbar */
    .modal-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1e293b;
      padding: 0.875rem 1.25rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      color: #ffffff;
    }

    .toolbar-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .cert-badge {
      font-size: 0.9rem;
      font-weight: 700;
      color: #34d399;
    }

    .cert-num {
      font-family: monospace;
      font-size: 0.85rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      color: #94a3b8;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .copy-btn {
      background: rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }
    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .print-btn {
      background: linear-gradient(135deg, #00a887 0%, #008f72 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.3);
    }
    .print-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 168, 135, 0.4);
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .close-btn:hover {
      background: #ef4444;
      color: #ffffff;
    }

    /* Certificate Paper Container */
    .certificate-paper-wrapper {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      padding: 1.25rem;
      position: relative;
    }

    /* Luxury Certificate Frame */
    .certificate-frame {
      border: 6px double #00a887;
      outline: 2px solid #d97706;
      outline-offset: -14px;
      padding: 2.75rem 3rem;
      position: relative;
      background: radial-gradient(circle at 50% 50%, #ffffff 0%, #fafcfb 100%);
      text-align: center;
      color: #1e293b;
      min-height: 560px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Corner Ornaments */
    .corner-ornament {
      position: absolute;
      width: 28px;
      height: 28px;
      border: 3px solid #d97706;
    }
    .corner-ornament.top-left { top: 18px; left: 18px; border-right: none; border-bottom: none; }
    .corner-ornament.top-right { top: 18px; right: 18px; border-left: none; border-bottom: none; }
    .corner-ornament.bottom-left { bottom: 18px; left: 18px; border-right: none; border-top: none; }
    .corner-ornament.bottom-right { bottom: 18px; right: 18px; border-left: none; border-top: none; }

    /* Header */
    .cert-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .company-brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      text-align: left;
    }

    .brand-logo-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #00a887 0%, #065f46 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      font-size: 1rem;
      letter-spacing: 1px;
      box-shadow: 0 4px 10px rgba(0, 168, 135, 0.3);
    }

    .company-name {
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #0f172a;
      margin: 0;
    }

    .company-sub {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #00a887;
      margin: 0.15rem 0 0 0;
    }

    .cert-badge-seal {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }

    .seal-circle {
      width: 100%;
      height: 100%;
      border: 1px dashed rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 0.55rem;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .seal-star { font-size: 0.5rem; line-height: 1; }

    /* Title */
    .cert-title-section {
      margin-bottom: 1.25rem;
    }

    .main-title {
      font-family: 'Times New Roman', Times, serif, sans-serif;
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: 3px;
      color: #00a887;
      margin: 0;
      text-transform: uppercase;
    }

    .sub-title {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0.25rem 0 0.75rem 0;
      font-weight: 500;
    }

    .decorative-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      max-width: 280px;
      margin: 0.5rem auto 0 auto;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, #d97706, transparent);
    }

    .divider-diamond {
      color: #d97706;
      font-size: 0.75rem;
    }

    /* Recipient */
    .recipient-section {
      margin-bottom: 1.25rem;
    }

    .present-text {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0 0 0.5rem 0;
    }

    .recipient-name {
      font-family: 'Georgia', serif, sans-serif;
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
      letter-spacing: 0.5px;
    }

    .recipient-role {
      font-size: 0.875rem;
      color: #00a887;
      font-weight: 600;
      margin: 0;
    }

    /* Course */
    .course-section {
      margin-bottom: 1.5rem;
    }

    .achievement-text {
      font-size: 0.875rem;
      color: #475569;
      margin: 0 0 0.5rem 0;
    }

    .course-name {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      line-height: 1.3;
    }

    .course-thai-name {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0.25rem 0 0.75rem 0;
    }

    .skills-tags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .skill-tag {
      background: rgba(0, 168, 135, 0.08);
      color: #008f72;
      border: 1px solid rgba(0, 168, 135, 0.25);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }

    /* Footer */
    .cert-footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .signature-block {
      flex: 1;
      max-width: 220px;
      text-align: center;
    }

    .signature-line {
      height: 48px;
      border-bottom: 1.5px solid #94a3b8;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      margin-bottom: 0.5rem;
      padding-bottom: 4px;
    }

    .script-signature {
      font-family: 'Brush Script MT', 'Segoe Script', cursive, sans-serif;
      font-size: 1.4rem;
      color: #0f172a;
      transform: rotate(-3deg);
    }

    .script-signature.ceo-sign {
      color: #065f46;
      transform: rotate(-2deg);
    }

    .signer-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .signer-title {
      font-size: 0.7rem;
      color: #64748b;
      margin: 0.15rem 0 0 0;
      line-height: 1.2;
    }

    .cert-meta-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-align: center;
    }

    .qr-mock {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
    }

    .qr-pattern {
      width: 44px;
      height: 44px;
      border: 2px solid #00a887;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0fdf4;
      font-size: 1.2rem;
    }

    .qr-label {
      font-size: 0.65rem;
      color: #64748b;
      font-weight: 600;
    }

    .meta-details p {
      margin: 0.1rem 0;
      font-size: 0.75rem;
      color: #64748b;
    }

    .meta-cert-no code {
      background: #f1f5f9;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      color: #00a887;
      font-weight: 700;
    }

    /* Print Styles */
    @media print {
      body * {
        visibility: hidden;
      }
      .certificate-modal-overlay,
      .certificate-modal-overlay * {
        visibility: visible;
      }
      .certificate-modal-overlay {
        position: absolute;
        inset: 0;
        background: transparent !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .certificate-paper-wrapper {
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .certificate-frame {
        border-width: 4px !important;
        min-height: 100vh !important;
        box-sizing: border-box !important;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .certificate-frame {
        padding: 1.5rem 1rem;
        min-height: auto;
      }
      .main-title {
        font-size: 1.4rem;
      }
      .recipient-name {
        font-size: 1.4rem;
      }
      .course-name {
        font-size: 1.1rem;
      }
      .cert-footer {
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }
      .modal-toolbar {
        flex-direction: column;
        gap: 0.75rem;
        align-items: flex-start;
      }
      .toolbar-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class CertificateViewerComponent {
  @Input({ required: true }) certificate!: Certificate;
  @Output() close = new EventEmitter<void>();

  readonly copied = signal<boolean>(false);

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('certificate-modal-overlay')) {
      this.close.emit();
    }
  }

  printCertificate(): void {
    window.print();
  }

  copyLink(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.certificate.verificationUrl).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2500);
      });
    }
  }
}

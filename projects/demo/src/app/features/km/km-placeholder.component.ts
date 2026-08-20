import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-km-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="placeholder-page">
      <div class="placeholder-card">
        <div class="icon">💡</div>
        <h2>คลังความรู้องค์กร (Knowledge Base KM)</h2>
        <p>ศูนย์รวม Wiki และเอกสารทางเทคนิคแยกตามแผนก (Software Dev, QA, HR, Sales, IT Support)</p>
        <a routerLink="/" class="back-link">← กลับหน้าแรก</a>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-page { max-width: 900px; margin: 3rem auto; padding: 1.5rem; }
    .placeholder-card {
      background: var(--sic-color-bg, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h2 { font-size: 1.5rem; font-weight: 800; color: var(--sic-color-text-active, #0f172a); margin: 0 0 0.5rem 0; }
    p { color: var(--sic-color-text-muted, #64748b); font-size: 0.95rem; margin-bottom: 1.5rem; }
    .back-link { color: #0284c7; font-weight: 700; text-decoration: none; }
  `]
})
export class KmPlaceholderComponent {}

import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AiAssistantService } from '../../services/ai-assistant.service';
import { AiMode } from '../../models/ai-assistant.model';

@Component({
  selector: 'app-ai-assistant-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- 1. Floating Launcher Button (Bottom-Right) -->
    <div class="ai-launcher-wrapper" [class.hidden]="isOpen()">
      <button
        type="button"
        class="ai-launcher-btn"
        (click)="openChat()"
        title="ปรึกษา SICR AI Knowledge Assistant"
        aria-label="Open AI Assistant"
      >
        <div class="launcher-pulse"></div>
        <div class="launcher-icon-box">
          <span class="ai-sparkle-icon">✨</span>
          <span class="ai-bot-icon">🤖</span>
        </div>
        <div class="launcher-text-box">
          <span class="launcher-title">SICR AI Assistant</span>
          <span class="launcher-subtitle">ถามการใช้งาน & ติวบทเรียน</span>
        </div>
      </button>
    </div>

    <!-- 2. AI Chat Window / Drawer -->
    @if (isOpen()) {
      <div class="ai-chat-window" [class.minimized]="isMinimized()">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-main-row">
            <div class="bot-profile">
              <div class="bot-avatar">
                <span>🤖</span>
                <div class="online-indicator"></div>
              </div>
              <div class="bot-info">
                <div class="bot-name-row">
                  <span class="bot-name">SICR AI Assistant</span>
                  <span class="ai-badge">SMART AI</span>
                </div>
                <span class="bot-status">
                  {{ currentMode() === 'system' ? '🧭 แนะนำการใช้งานระบบ' : '🎓 ผู้ช่วยติว & คลังความรู้' }}
                </span>
              </div>
            </div>

            <div class="header-actions">
              <button
                type="button"
                class="icon-action-btn"
                (click)="clearChat()"
                title="ล้างประวัติการสนทนา"
                aria-label="Clear chat"
              >
                🔄
              </button>
              <button
                type="button"
                class="icon-action-btn"
                (click)="toggleMinimize()"
                [title]="isMinimized() ? 'ขยายหน้าต่าง' : 'ย่อหน้าต่าง'"
                aria-label="Toggle minimize"
              >
                {{ isMinimized() ? '🗖' : '🗕' }}
              </button>
              <button
                type="button"
                class="icon-action-btn close"
                (click)="closeChat()"
                title="ปิดหน้าต่าง AI"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Mode Switcher Tabs (2 Modalities) -->
          @if (!isMinimized()) {
            <div class="mode-tabs-bar">
              <button
                type="button"
                class="mode-tab"
                [class.active]="currentMode() === 'system'"
                (click)="switchMode('system')"
              >
                <span class="tab-icon">🧭</span>
                <span class="tab-title">1. แนะนำใช้ระบบ (System)</span>
              </button>

              <button
                type="button"
                class="mode-tab"
                [class.active]="currentMode() === 'learning'"
                (click)="switchMode('learning')"
              >
                <span class="tab-icon">🎓</span>
                <span class="tab-title">2. ติวบทเรียน & KM</span>
              </button>
            </div>
          }
        </div>

        @if (!isMinimized()) {
          <!-- Chat Message Flow Area -->
          <div class="chat-messages-area" #scrollContainer>
            @for (msg of messages(); track msg.id) {
              <div class="message-row" [ngClass]="msg.sender">
                @if (msg.sender === 'assistant') {
                  <div class="msg-avatar">🤖</div>
                }

                <div class="msg-bubble-wrapper">
                  <div class="msg-bubble">
                    <div class="msg-content-markdown" [innerHTML]="formatMarkdown(msg.content)"></div>

                    <!-- Code Snippet Box (if provided) -->
                    @if (msg.codeSnippet) {
                      <div class="code-snippet-box">
                        <div class="code-header">
                          <span class="lang-tag">{{ msg.codeSnippet.language }}</span>
                          <button
                            type="button"
                            class="copy-code-btn"
                            (click)="copyCode(msg.codeSnippet.code, $event)"
                          >
                            📋 คัดลอกโค้ด
                          </button>
                        </div>
                        <pre><code>{{ msg.codeSnippet.code }}</code></pre>
                      </div>
                    }

                    <!-- Action Link Buttons (for system navigation) -->
                    @if (msg.actions && msg.actions.length > 0) {
                      <div class="actions-buttons-grid">
                        @for (action of msg.actions; track action.url) {
                          <a
                            [routerLink]="action.url"
                            class="action-shortcut-btn"
                            (click)="onActionClick()"
                          >
                            <span>{{ action.icon || '👉' }}</span>
                            <span>{{ action.label }}</span>
                          </a>
                        }
                      </div>
                    }

                    <!-- Source Citations (for KM / Course reference) -->
                    @if (msg.sources && msg.sources.length > 0) {
                      <div class="sources-box">
                        <span class="sources-title">📌 แหล่งอ้างอิง:</span>
                        <div class="sources-list">
                          @for (src of msg.sources; track src.url) {
                            <a
                              [routerLink]="src.url"
                              class="source-badge"
                              (click)="onActionClick()"
                            >
                              <span>{{ src.type === 'km' ? '📄 KM' : '🎓 คอร์ส' }}</span>
                              <span class="src-text">{{ src.title }}</span>
                            </a>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <span class="msg-time">{{ msg.timestamp }}</span>
                </div>
              </div>
            }

            <!-- Typing Indicator Animation -->
            @if (isTyping()) {
              <div class="message-row assistant typing-row">
                <div class="msg-avatar">🤖</div>
                <div class="typing-bubble">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
            }
          </div>

          <!-- Quick Prompt Suggestions Chips -->
          <div class="prompt-suggestions-bar">
            <div class="suggestions-scroll">
              @for (prompt of promptSuggestions(); track prompt.text) {
                <button
                  type="button"
                  class="prompt-chip"
                  (click)="sendQuickPrompt(prompt.text)"
                >
                  <span class="chip-icon">{{ prompt.icon }}</span>
                  <span class="chip-text">{{ prompt.text }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Chat Input Footer -->
          <div class="chat-input-footer">
            <form (submit)="onSubmit($event)" class="input-form">
              <input
                #inputEl
                type="text"
                class="chat-input"
                [placeholder]="currentMode() === 'system' ? 'พิมพ์ถามวิธีใช้งานระบบ...' : 'พิมพ์ถามเนื้อหาบทเรียน หรือโค้ดตัวอย่าง...'"
                [(ngModel)]="userInput"
                name="messageText"
                [disabled]="isTyping()"
                autocomplete="off"
              />
              <button
                type="submit"
                class="send-btn"
                [disabled]="!userInput.trim() || isTyping()"
                title="ส่งข้อความ (Enter)"
                aria-label="Send"
              >
                <svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    /* 1. Floating Launcher Button */
    .ai-launcher-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1500;
      animation: floatIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ai-launcher-wrapper.hidden {
      display: none;
    }

    @keyframes floatIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .ai-launcher-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.15rem 0.65rem 0.85rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: linear-gradient(135deg, #00a887 0%, #0284c7 100%);
      color: #ffffff;
      cursor: pointer;
      box-shadow: 0 10px 25px -4px rgba(0, 168, 135, 0.45);
      transition: all 0.25s ease;
      font-family: inherit;
    }

    .ai-launcher-btn:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 14px 30px -4px rgba(0, 168, 135, 0.6);
    }

    .launcher-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 999px;
      border: 2px solid #00a887;
      opacity: 0;
      animation: pulseAnim 2.5s infinite;
      pointer-events: none;
    }

    @keyframes pulseAnim {
      0% {
        transform: scale(0.95);
        opacity: 0.8;
      }
      70% {
        transform: scale(1.15);
        opacity: 0;
      }
      100% {
        transform: scale(1.15);
        opacity: 0;
      }
    }

    .launcher-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .ai-sparkle-icon {
      position: absolute;
      top: -4px;
      right: -4px;
      font-size: 0.85rem;
      animation: sparkleRotate 3s ease-in-out infinite;
    }

    @keyframes sparkleRotate {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(20deg) scale(1.2); }
    }

    .launcher-text-box {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .launcher-title {
      font-size: 0.92rem;
      font-weight: 800;
      letter-spacing: -0.2px;
      line-height: 1.2;
    }

    .launcher-subtitle {
      font-size: 0.72rem;
      opacity: 0.9;
      font-weight: 500;
    }

    /* 2. AI Chat Window */
    .ai-chat-window {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 440px;
      max-width: calc(100vw - 32px);
      height: 640px;
      max-height: calc(100vh - 48px);
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      border-radius: 20px;
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.25);
      z-index: 1600;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: chatSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transition: height 0.25s ease;
    }

    .ai-chat-window.minimized {
      height: auto;
    }

    @keyframes chatSlideUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Chat Header */
    .chat-header {
      background: var(--sic-color-surface, #f8fafc);
      border-bottom: 1px solid var(--sic-color-border, #e2e8f0);
      padding: 0.85rem 1rem 0.6rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .header-main-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .bot-profile {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .bot-avatar {
      width: 38px;
      height: 38px;
      border-radius: 11px;
      background: linear-gradient(135deg, #00a887 0%, #0284c7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: #ffffff;
      position: relative;
      flex-shrink: 0;
    }

    .online-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: #10b981;
      border: 2px solid #ffffff;
      border-radius: 50%;
    }

    .bot-info {
      display: flex;
      flex-direction: column;
    }

    .bot-name-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .bot-name {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--sic-color-text-active, #0f172a);
    }

    .ai-badge {
      font-size: 0.6rem;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      background: rgba(0, 168, 135, 0.12);
      color: #00a887;
      border-radius: 4px;
    }

    .bot-status {
      font-size: 0.72rem;
      color: var(--sic-color-text-muted, #64748b);
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .icon-action-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
      background: var(--sic-color-bg, #ffffff);
      color: var(--sic-color-text-muted, #64748b);
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .icon-action-btn:hover {
      background: var(--sic-color-surface, #f1f5f9);
      color: var(--sic-color-text, #1e293b);
    }

    .icon-action-btn.close:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }

    /* Mode Switcher Tabs */
    .mode-tabs-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem;
      background: var(--sic-color-bg, #ffffff);
      padding: 0.25rem;
      border-radius: 10px;
      border: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .mode-tab {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.35rem 0.5rem;
      border-radius: 7px;
      border: none;
      background: transparent;
      color: var(--sic-color-text-muted, #64748b);
      font-size: 0.76rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .mode-tab:hover {
      color: var(--sic-color-text, #1e293b);
    }

    .mode-tab.active {
      background: linear-gradient(135deg, rgba(0, 168, 135, 0.12), rgba(2, 132, 199, 0.12));
      color: #00a887;
      border: 1px solid rgba(0, 168, 135, 0.3);
    }

    /* Message Area */
    .chat-messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message-row {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      width: 100%;
    }

    .message-row.user {
      flex-direction: row-reverse;
    }

    .msg-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(0, 168, 135, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .msg-bubble-wrapper {
      max-width: 84%;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .message-row.user .msg-bubble-wrapper {
      align-items: flex-end;
    }

    .msg-bubble {
      padding: 0.75rem 0.95rem;
      border-radius: 16px;
      font-size: 0.86rem;
      line-height: 1.5;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      word-break: break-word;
    }

    .message-row.assistant .msg-bubble {
      background: var(--sic-color-surface, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      color: var(--sic-color-text, #1e293b);
      border-top-left-radius: 4px;
    }

    .message-row.user .msg-bubble {
      background: linear-gradient(135deg, #00a887 0%, #008f73 100%);
      color: #ffffff;
      border-top-right-radius: 4px;
    }

    .msg-time {
      font-size: 0.68rem;
      color: var(--sic-color-text-muted, #94a3b8);
      padding: 0 0.25rem;
    }

    /* Markdown inside bubble */
    .msg-content-markdown strong {
      font-weight: 700;
    }

    /* Code Snippet */
    .code-snippet-box {
      margin-top: 0.65rem;
      border-radius: 10px;
      background: #0f172a;
      color: #e2e8f0;
      overflow: hidden;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.76rem;
    }

    .code-header {
      background: #1e293b;
      padding: 0.3rem 0.6rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #334155;
    }

    .lang-tag {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #38bdf8;
    }

    .copy-code-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 0.68rem;
      cursor: pointer;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      transition: color 0.15s ease;
    }

    .copy-code-btn:hover {
      color: #ffffff;
    }

    .code-snippet-box pre {
      margin: 0;
      padding: 0.65rem;
      overflow-x: auto;
    }

    /* Action Buttons Grid */
    .actions-buttons-grid {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.65rem;
    }

    .action-shortcut-btn {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid rgba(0, 168, 135, 0.35);
      color: #007965;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .action-shortcut-btn:hover {
      background: rgba(0, 168, 135, 0.1);
      transform: translateX(2px);
    }

    /* Sources Box */
    .sources-box {
      margin-top: 0.65rem;
      padding-top: 0.5rem;
      border-top: 1px dashed var(--sic-color-border, #e2e8f0);
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .sources-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--sic-color-text-muted, #64748b);
    }

    .sources-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .source-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      color: #0284c7;
      font-size: 0.72rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .source-badge:hover {
      border-color: #0284c7;
      background: rgba(2, 132, 199, 0.08);
    }

    .src-text {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Typing Dots */
    .typing-bubble {
      padding: 0.65rem 0.85rem;
      border-radius: 14px;
      background: var(--sic-color-surface, #f8fafc);
      border: 1px solid var(--sic-color-border, #e2e8f0);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .typing-bubble .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00a887;
      opacity: 0.4;
      animation: typingPulse 1.2s infinite ease-in-out;
    }

    .typing-bubble .dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-bubble .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typingPulse {
      0%, 100% { transform: scale(0.8); opacity: 0.3; }
      50% { transform: scale(1.3); opacity: 1; }
    }

    /* Prompt Suggestions */
    .prompt-suggestions-bar {
      padding: 0.45rem 0.75rem;
      background: var(--sic-color-surface, #f8fafc);
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
      overflow-x: auto;
    }

    .suggestions-scroll {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }

    .prompt-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      background: var(--sic-color-bg, #ffffff);
      border: 1px solid var(--sic-color-border, #cbd5e1);
      color: var(--sic-color-text, #334155);
      font-size: 0.74rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .prompt-chip:hover {
      border-color: #00a887;
      color: #00a887;
      background: rgba(0, 168, 135, 0.08);
      transform: translateY(-1px);
    }

    /* Chat Input Footer */
    .chat-input-footer {
      padding: 0.65rem 0.85rem;
      background: var(--sic-color-bg, #ffffff);
      border-top: 1px solid var(--sic-color-border, #e2e8f0);
    }

    .input-form {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chat-input {
      flex: 1;
      padding: 0.6rem 0.85rem;
      border-radius: 12px;
      border: 1px solid var(--sic-color-border, #cbd5e1);
      background: var(--sic-color-surface, #f8fafc);
      color: var(--sic-color-text, #0f172a);
      font-size: 0.84rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .chat-input:focus {
      border-color: #00a887;
      box-shadow: 0 0 0 3px rgba(0, 168, 135, 0.15);
      background: var(--sic-color-bg, #ffffff);
    }

    .send-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #00a887 0%, #007965 100%);
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 168, 135, 0.35);
    }

    .send-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .send-icon {
      width: 17px;
      height: 17px;
      transform: rotate(45deg);
    }

    /* Dark Mode Overrides */
    :host-context([data-theme='dark']),
    :host-context(.dark) {
      .message-row.assistant .msg-bubble {
        background: #1e293b;
        border-color: #334155;
        color: #f1f5f9;
      }
      .action-shortcut-btn {
        background: #0f172a;
        color: #2dd4bf;
      }
      .source-badge {
        background: #0f172a;
        border-color: #334155;
        color: #38bdf8;
      }
      .prompt-chip {
        background: #1e293b;
        border-color: #334155;
        color: #cbd5e1;
      }
    }

    @media (max-width: 480px) {
      .ai-chat-window {
        bottom: 0;
        right: 0;
        width: 100vw;
        max-width: 100vw;
        height: 85vh;
        max-height: 85vh;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  `],
})
export class AiAssistantWidgetComponent {
  private readonly aiService = inject(AiAssistantService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl?: ElementRef<HTMLInputElement>;

  readonly isOpen = this.aiService.isOpen;
  readonly currentMode = this.aiService.currentMode;
  readonly messages = this.aiService.messages;
  readonly promptSuggestions = this.aiService.promptSuggestions;
  readonly isTyping = this.aiService.isTyping;

  readonly isMinimized = signal(false);
  userInput = '';

  constructor() {
    effect(() => {
      // Auto-scroll on new message
      this.messages();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  openChat(): void {
    this.aiService.openChat();
    this.isMinimized.set(false);
    setTimeout(() => this.inputEl?.nativeElement.focus(), 150);
  }

  closeChat(): void {
    this.aiService.closeChat();
  }

  toggleMinimize(): void {
    this.isMinimized.update((v) => !v);
  }

  switchMode(mode: AiMode): void {
    this.aiService.setMode(mode);
  }

  clearChat(): void {
    this.aiService.clearChat();
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (!this.userInput.trim() || this.isTyping()) return;

    this.aiService.sendMessage(this.userInput);
    this.userInput = '';
  }

  sendQuickPrompt(text: string): void {
    this.aiService.sendMessage(text);
  }

  onActionClick(): void {
    // Keep chat open or minimize if on mobile
    if (window.innerWidth < 640) {
      this.isMinimized.set(true);
    }
  }

  copyCode(code: string, event: MouseEvent): void {
    navigator.clipboard.writeText(code);
    const target = event.target as HTMLElement;
    if (target) {
      const originalText = target.innerText;
      target.innerText = '✅ คัดลอกแล้ว!';
      setTimeout(() => {
        target.innerText = originalText;
      }, 1500);
    }
  }

  formatMarkdown(content: string): string {
    // Simple fast markdown parser for bold, italic, linebreaks
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    return formatted;
  }

  private scrollToBottom(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}

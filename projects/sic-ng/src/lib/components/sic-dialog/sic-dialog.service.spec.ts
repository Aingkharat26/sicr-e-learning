import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicCommonDialogComponent } from './sic-common-dialog.component';
import { SIC_DIALOG_DATA, SicDialogRef, SicDialogService } from './sic-dialog.service';

interface GreetDialogData {
  name: string;
}

@Component({
  standalone: true,
  template: `<p>Hello {{ data.name }}</p>`,
})
class GreetDialogComponent {
  readonly data = inject(SIC_DIALOG_DATA) as GreetDialogData;
  readonly dialogRef = inject<SicDialogRef<GreetDialogComponent, string>>(SicDialogRef);

  confirm(): void {
    this.dialogRef.close(`hello, ${this.data.name}`);
  }
}

/** Deliberately declares its own display so the panel must not stomp on it. */
@Component({
  standalone: true,
  template: `<p>Flex dialog</p>`,
  host: { style: 'display: flex' },
})
class FlexDialogComponent {}

describe('SicDialogService', () => {
  let service: SicDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SicDialogService);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('injects the data passed as the second argument into the opened component', () => {
    const handle = service.open<GreetDialogComponent, GreetDialogData, string>(GreetDialogComponent, { name: 'Ada' });

    expect(handle.componentInstance.data).toEqual({ name: 'Ada' });
    handle.close();
  });

  it('applies width/height from the third argument to the overlay pane', () => {
    const handle = service.open(GreetDialogComponent, { name: 'Ada' }, { width: '90%', height: '80%' });

    const pane: HTMLElement = document.querySelector('.cdk-overlay-pane')!;
    expect(pane.style.width).toBe('90%');
    expect(pane.style.height).toBe('80%');
    handle.close();
  });

  it('centers the panel inside the pane even when a custom width/height makes the pane much bigger than the panel', () => {
    const handle = service.open(GreetDialogComponent, { name: 'Ada' }, { width: '90%', height: '80%' });

    const pane: HTMLElement = document.querySelector('.cdk-overlay-pane')!;
    expect(pane.classList.contains('sic-dialog-overlay-pane')).toBe(true);
    handle.close();
  });

  it('renders the content inside a real sic-dialog-panel wrapper and dims the backdrop inline', () => {
    const handle = service.open(GreetDialogComponent, { name: 'Ada' });
    TestBed.inject(ApplicationRef).tick();

    const pane: HTMLElement = document.querySelector('.cdk-overlay-pane')!;
    const panel = pane.querySelector('sic-dialog-panel');
    expect(panel).toBeTruthy();
    expect(panel?.querySelector('p')?.textContent).toContain('Hello Ada');

    // The backdrop element is outside any Angular component's template, so it
    // must be dimmed via a direct inline style rather than a CSS class.
    const backdrop: HTMLElement = document.querySelector('.cdk-overlay-backdrop')!;
    expect(backdrop.style.background).toContain('color-mix');

    handle.close();
  });

  it('forces display:block on a custom dialog component that never declared its own :host display — otherwise it defaults to inline, which ignores width/margin and breaks centering', () => {
    const handle = service.open(GreetDialogComponent, { name: 'Ada' });
    TestBed.inject(ApplicationRef).tick();

    const pane: HTMLElement = document.querySelector('.cdk-overlay-pane')!;
    const content = pane.querySelector('sic-dialog-panel')!.firstElementChild as HTMLElement;
    expect(content.style.display).toBe('block');

    handle.close();
  });

  it('leaves a custom dialog component alone when it already declares its own display', () => {
    const handle = service.open(FlexDialogComponent);
    TestBed.inject(ApplicationRef).tick();

    const pane: HTMLElement = document.querySelector('.cdk-overlay-pane')!;
    const content = pane.querySelector('sic-dialog-panel')!.firstElementChild as HTMLElement;
    expect(content.style.display).toBe('flex');

    handle.close();
  });

  it('emits the value passed to SicDialogRef.close() to subscribers, then completes', () => {
    const handle = service.open<GreetDialogComponent, GreetDialogData, string>(GreetDialogComponent, { name: 'Ada' });

    const received: (string | undefined)[] = [];
    let completed = false;
    handle.subscribe({
      next: (value) => received.push(value),
      complete: () => (completed = true),
    });

    handle.componentInstance.confirm();

    expect(received).toEqual(['hello, Ada']);
    expect(completed).toBe(true);
  });

  it('closing via the handle itself (no result) emits undefined to subscribers', () => {
    const handle = service.open<GreetDialogComponent, GreetDialogData, string>(GreetDialogComponent, { name: 'Ada' });

    const received: (string | undefined)[] = [];
    handle.subscribe((value) => received.push(value));

    handle.close();

    expect(received).toEqual([undefined]);
  });

  it('closing on the backdrop click emits undefined and disposes the overlay', () => {
    const handle = service.open<GreetDialogComponent, GreetDialogData, string>(GreetDialogComponent, { name: 'Ada' });

    const received: (string | undefined)[] = [];
    handle.subscribe((value) => received.push(value));

    const backdrop: HTMLElement = document.querySelector('.cdk-overlay-backdrop')!;
    backdrop.click();

    expect(received).toEqual([undefined]);
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('does not close on backdrop click when disableClose is set', () => {
    const handle = service.open(GreetDialogComponent, { name: 'Ada' }, { disableClose: true });

    const backdrop: HTMLElement = document.querySelector('.cdk-overlay-backdrop')!;
    backdrop.click();

    expect(document.querySelector('.cdk-overlay-pane')).toBeTruthy();
    handle.close();
  });

  describe('common dialogs (info/success/danger/warning/confirm)', () => {
    function pane(): HTMLElement {
      TestBed.inject(ApplicationRef).tick();
      return document.querySelector('.cdk-overlay-pane')!;
    }

    (['info', 'success', 'danger', 'warning'] as const).forEach((method) => {
      it(`${method}() renders the icon/title/description and a single Close button that emits void on click`, () => {
        const received: unknown[] = [];
        let completed = false;
        service[method]('Title', 'Description').subscribe({
          next: (v) => received.push(v),
          complete: () => (completed = true),
        });

        expect(pane().querySelector('.sic-common-dialog__title')?.textContent).toContain('Title');
        expect(pane().querySelector('.sic-common-dialog__description')?.textContent).toContain('Description');
        expect(pane().querySelector(`.sic-common-dialog__icon--${method}`)).toBeTruthy();

        const buttons = pane().querySelectorAll('.sic-common-dialog__actions button');
        expect(buttons.length).toBe(1);
        (buttons[0] as HTMLButtonElement).click();

        expect(received).toEqual([undefined]);
        expect(completed).toBe(true);
        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
      });
    });

    it('confirm() shows Cancel/Confirm buttons and emits true when Confirm is clicked', () => {
      const received: boolean[] = [];
      service.confirm('Delete item?', 'This cannot be undone').subscribe((v) => received.push(v));

      const buttons = pane().querySelectorAll('.sic-common-dialog__actions button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toContain('Cancel');
      expect(buttons[1].textContent).toContain('Confirm');

      (buttons[1] as HTMLButtonElement).click();

      expect(received).toEqual([true]);
    });

    it('confirm() emits false when Cancel is clicked', () => {
      const received: boolean[] = [];
      service.confirm('Delete item?', 'This cannot be undone').subscribe((v) => received.push(v));

      const buttons = pane().querySelectorAll('.sic-common-dialog__actions button');
      (buttons[0] as HTMLButtonElement).click();

      expect(received).toEqual([false]);
    });

    it('confirm() emits false when dismissed via the backdrop', () => {
      const received: boolean[] = [];
      service.confirm('Delete item?', 'This cannot be undone').subscribe((v) => received.push(v));

      const backdrop: HTMLElement = document.querySelector('.cdk-overlay-backdrop')!;
      backdrop.click();

      expect(received).toEqual([false]);
    });
  });
});

describe('SicDialogService common dialogs SIC_CONFIG defaults', () => {
  function pane(): HTMLElement {
    TestBed.inject(ApplicationRef).tick();
    return document.querySelector('.cdk-overlay-pane')!;
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('uses SIC_CONFIG.messages.cancel/confirm/close as button-text fallbacks', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SIC_CONFIG, useValue: { messages: { cancel: 'ยกเลิก', confirm: 'ยืนยัน', close: 'ปิด' } } }],
    });
    const service = TestBed.inject(SicDialogService);

    service.info('Title', 'Description').subscribe();
    expect(pane().querySelector('.sic-common-dialog__actions button')?.textContent).toContain('ปิด');
    (pane().querySelector('.sic-common-dialog__actions button') as HTMLButtonElement).click();

    service.confirm('Title', 'Description').subscribe();
    const buttons = pane().querySelectorAll('.sic-common-dialog__actions button');
    expect(buttons[0].textContent).toContain('ยกเลิก');
    expect(buttons[1].textContent).toContain('ยืนยัน');
  });

  it('still lets a per-call cancelText/confirmText win over SIC_CONFIG when opened directly with SicCommonDialogComponent', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SIC_CONFIG, useValue: { messages: { cancel: 'ยกเลิก', confirm: 'ยืนยัน' } } }],
    });
    const service = TestBed.inject(SicDialogService);

    service.open(SicCommonDialogComponent, {
      type: 'confirm',
      title: 'Title',
      description: 'Description',
      cancelText: 'No',
      confirmText: 'Yes',
    });

    const buttons = pane().querySelectorAll('.sic-common-dialog__actions button');
    expect(buttons[0].textContent).toContain('No');
    expect(buttons[1].textContent).toContain('Yes');
  });
});

import { ApplicationRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicPopoverComponent } from './sic-popover.component';
import {
  SicPopoverButtonDirective,
  SicPopoverFooterDirective,
  SicPopoverHeaderDirective,
  SicPopoverListDirective,
} from './sic-popover-template.directive';

describe('SicPopoverComponent', () => {
  let fixture: ComponentFixture<SicPopoverComponent<string>>;
  let component: SicPopoverComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicPopoverComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicPopoverComponent) as ComponentFixture<SicPopoverComponent<string>>;
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', ['Apple', 'Banana', 'Cherry']);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  function panel(): HTMLElement {
    tick();
    return document.querySelector('.cdk-overlay-pane')!;
  }

  it('renders the default "⋯" trigger button and nothing in the overlay container until opened', () => {
    expect(fixture.nativeElement.querySelector('.sic-popover__default-trigger')).toBeTruthy();
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('opens an overlay listing every item when the default trigger is clicked, closing on a second click', () => {
    fixture.nativeElement.querySelector('.sic-popover__default-trigger').click();
    fixture.detectChanges();

    const items = panel().querySelectorAll('.sic-popover__list-item');
    expect(items.length).toBe(3);
    expect(items[1].textContent?.trim()).toBe('Banana');

    fixture.nativeElement.querySelector('.sic-popover__default-trigger').click();
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('supports being driven externally via [open]/(openChange)', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(panel()).toBeTruthy();

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('shows the empty state when items is empty', () => {
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(panel().querySelector('.sic-popover__empty')?.textContent).toBe('No items');
  });

  it('emits itemSelect and openChange(false), closing on click by default', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const selectSpy = vi.fn();
    const openChangeSpy = vi.fn();
    component.itemSelect.subscribe(selectSpy);
    component.openChange.subscribe(openChangeSpy);

    (panel().querySelectorAll('.sic-popover__list-item')[2] as HTMLElement).click();
    fixture.detectChanges();

    expect(selectSpy).toHaveBeenCalledWith('Cherry');
    expect(openChangeSpy).toHaveBeenCalledWith(false);
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('stays open after selection when closeOnSelect is false', () => {
    fixture.componentRef.setInput('closeOnSelect', false);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    (panel().querySelectorAll('.sic-popover__list-item')[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane')).toBeTruthy();
  });

  it('closes and emits openChange(false) on backdrop click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    panel();

    const openChangeSpy = vi.fn();
    component.openChange.subscribe(openChangeSpy);

    const backdrop: HTMLElement = document.querySelector('.cdk-overlay-backdrop')!;
    backdrop.click();
    fixture.detectChanges();

    expect(openChangeSpy).toHaveBeenCalledWith(false);
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('closes on Escape', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    panel();

    const openChangeSpy = vi.fn();
    component.openChange.subscribe(openChangeSpy);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(openChangeSpy).toHaveBeenCalledWith(false);
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });
});

describe('SicPopoverComponent SIC_CONFIG defaults', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('uses SIC_CONFIG.messages.noItems for the empty state', async () => {
    await TestBed.configureTestingModule({
      imports: [SicPopoverComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { messages: { noItems: 'ไม่มีข้อมูล' } } }],
    }).compileComponents();
    const cfgFixture = TestBed.createComponent(SicPopoverComponent) as ComponentFixture<SicPopoverComponent<string>>;
    cfgFixture.componentRef.setInput('items', []);
    cfgFixture.componentRef.setInput('open', true);
    cfgFixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();

    const pane: HTMLElement = document.querySelector('.cdk-overlay-pane')!;
    expect(pane.querySelector('.sic-popover__empty')?.textContent).toBe('ไม่มีข้อมูล');
  });
});

describe('SicPopoverComponent slot overrides', () => {
  @Component({
    standalone: true,
    imports: [
      SicPopoverComponent,
      SicPopoverButtonDirective,
      SicPopoverHeaderDirective,
      SicPopoverListDirective,
      SicPopoverFooterDirective,
    ],
    template: `
      <sic-popover [items]="items">
        <ng-template sicPopoverButton let-popover>
          <button type="button" class="custom-trigger" (click)="popover.toggle()">Open</button>
        </ng-template>
        <ng-template sicPopoverHeader>Custom header</ng-template>
        <ng-template sicPopoverList let-item let-index="index">
          <span class="custom-row">{{ index }}: {{ item }} 🍉</span>
        </ng-template>
        <ng-template sicPopoverFooter>Custom footer</ng-template>
      </sic-popover>
    `,
  })
  class SlotHostComponent {
    items = ['Apple', 'Banana'];
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('renders projected button/header/list/footer templates instead of the defaults', () => {
    TestBed.configureTestingModule({ imports: [SlotHostComponent] });
    const fixture = TestBed.createComponent(SlotHostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.sic-popover__default-trigger')).toBeNull();
    expect(root.querySelector('.custom-trigger')).toBeTruthy();

    root.querySelector<HTMLElement>('.custom-trigger')!.click();
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();

    const pane: HTMLElement = document.querySelector('.cdk-overlay-pane')!;
    expect(pane.textContent).toContain('Custom header');
    expect(pane.textContent).toContain('Custom footer');
    const rows = pane.querySelectorAll('.custom-row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('0: Apple 🍉');
    expect(rows[1].textContent).toContain('1: Banana 🍉');
  });
});

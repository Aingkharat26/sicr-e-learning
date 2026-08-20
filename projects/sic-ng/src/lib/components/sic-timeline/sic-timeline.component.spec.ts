import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicTimelineComponent } from './sic-timeline.component';
import { SicTimelineItem } from './sic-timeline.model';

const items: SicTimelineItem[] = [
  { title: 'Foundation', date: '2020', description: 'Founded the company.' },
  { title: 'First product', date: '2021', description: 'Launched product one.' },
  { title: 'Expansion', date: '2022', description: 'Opened new branches.' },
];

describe('SicTimelineComponent', () => {
  let fixture: ComponentFixture<SicTimelineComponent>;
  let component: SicTimelineComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicTimelineComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicTimelineComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  });

  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-timeline__row'));
  }

  function sideOf(row: HTMLElement): 'start' | 'end' {
    return row.querySelector('.sic-timeline__content--start')?.textContent?.trim() ? 'start' : 'end';
  }

  it('renders one circle per item, numbered from 1', () => {
    const circles = fixture.nativeElement.querySelectorAll('.sic-timeline__circle');
    expect(circles.length).toBe(3);
    expect(circles[0].textContent.trim()).toBe('1');
    expect(circles[2].textContent.trim()).toBe('3');
  });

  it('renders the default date/title/description block', () => {
    const first = rows()[0];
    expect(first.textContent).toContain('2020');
    expect(first.textContent).toContain('Foundation');
    expect(first.textContent).toContain('Founded the company.');
  });

  it('defaults to vertical orientation with no host classes set', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList.contains('sic-timeline--horizontal')).toBe(false);
    expect(host.classList.contains('sic-timeline--hide-start')).toBe(false);
    expect(host.classList.contains('sic-timeline--hide-end')).toBe(false);
  });

  it('adds the horizontal host class when orientation="horizontal"', () => {
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('sic-timeline--horizontal')).toBe(true);
  });

  it('alternates content sides by default, starting on "start"', () => {
    const r = rows();
    expect(sideOf(r[0])).toBe('start');
    expect(sideOf(r[1])).toBe('end');
    expect(sideOf(r[2])).toBe('start');
  });

  it('flips the starting side when side="end"', () => {
    fixture.componentRef.setInput('side', 'end');
    fixture.detectChanges();

    const r = rows();
    expect(sideOf(r[0])).toBe('end');
    expect(sideOf(r[1])).toBe('start');
  });

  it('keeps every item on one side when alternate is false, and hides the unused column', () => {
    fixture.componentRef.setInput('alternate', false);
    fixture.componentRef.setInput('side', 'end');
    fixture.detectChanges();

    const r = rows();
    expect(r.every((row) => sideOf(row) === 'end')).toBe(true);
    expect(fixture.nativeElement.classList.contains('sic-timeline--hide-start')).toBe(true);
    expect(fixture.nativeElement.classList.contains('sic-timeline--hide-end')).toBe(false);
  });

  it('hides the end column instead when one-sided with side="start"', () => {
    fixture.componentRef.setInput('alternate', false);
    fixture.componentRef.setInput('side', 'start');
    fixture.detectChanges();

    const r = rows();
    expect(r.every((row) => sideOf(row) === 'start')).toBe(true);
    expect(fixture.nativeElement.classList.contains('sic-timeline--hide-end')).toBe(true);
    expect(fixture.nativeElement.classList.contains('sic-timeline--hide-start')).toBe(false);
  });

  it('shows an icon instead of the index when item.icon is set', () => {
    fixture.componentRef.setInput('items', [{ ...items[0], icon: '🚀' }, items[1]]);
    fixture.detectChanges();

    const circles = fixture.nativeElement.querySelectorAll('.sic-timeline__circle');
    expect(circles[0].textContent.trim()).toBe('🚀');
    expect(circles[1].textContent.trim()).toBe('2');
  });
});

describe('SicTimelineComponent custom item template', () => {
  @Component({
    standalone: true,
    imports: [SicTimelineComponent],
    template: `
      <sic-timeline [items]="items">
        <ng-template #itemTemplate let-item let-index="index" let-side="side">
          <span class="custom-entry">{{ index }}/{{ side }}: {{ item.title }}</span>
        </ng-template>
      </sic-timeline>
    `,
  })
  class TemplateHostComponent {
    items = items;
  }

  it('renders the projected #itemTemplate for each entry instead of the default block', () => {
    TestBed.configureTestingModule({ imports: [TemplateHostComponent] });
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.custom-entry');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toBe('0/start: Foundation');
    expect(rows[1].textContent).toBe('1/end: First product');
    expect(fixture.nativeElement.querySelector('.sic-timeline__date')).toBeNull();
  });
});

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicTagColor } from '../sic-tag/sic-tag.component';
import { SicInputTagComponent } from './sic-input-tag.component';

@Component({
  standalone: true,
  imports: [FormsModule, SicInputTagComponent],
  template: `<sic-input-tag
    [(ngModel)]="value"
    [delimiter]="delimiter"
    [maxTagLength]="maxTagLength"
    [maxTags]="maxTags"
    [tagColor]="tagColor"
  />`,
})
class HostComponent {
  value: string | null = null;
  delimiter = ',';
  maxTagLength?: number;
  maxTags?: number;
  tagColor: SicTagColor = 'neutral';
}

describe('SicInputTagComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getComponent(): SicInputTagComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicInputTagComponent)
      .componentInstance;
  }

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.sic-input-tag__input');
  }

  function typeInto(text: string): void {
    const el = input();
    el.value = text;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('creates a tag once the input is terminated by the delimiter, leaving text after it pending', () => {
    typeInto('ขนม,ไทย');

    const cmp = getComponent();
    expect(cmp.tags).toEqual(['ขนม']);
    expect(cmp.inputValue).toBe('ไทย');
    expect(host.value).toBe('ขนม');
  });

  it('joins every committed tag into one delimited string as the ngModel value', () => {
    typeInto('ขนม,ไทย,นำเข้า,');

    expect(getComponent().tags).toEqual(['ขนม', 'ไทย', 'นำเข้า']);
    expect(host.value).toBe('ขนม,ไทย,นำเข้า');
  });

  it('parses an existing delimited string value back into tags', async () => {
    host.value = 'ขนม,ไทย,นำเข้า';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getComponent().tags).toEqual(['ขนม', 'ไทย', 'นำเข้า']);
    expect(fixture.nativeElement.querySelectorAll('.sic-tag__pill').length).toBe(3);
  });

  it('defaults tag pills to the neutral color', () => {
    typeInto('ขนม,');

    expect(getComponent().tagItems).toEqual([{ text: 'ขนม', color: 'neutral' }]);
    expect(fixture.nativeElement.querySelector('.sic-tag__pill')?.classList).toContain('sic-tag__pill--neutral');
  });

  it('applies tagColor to every rendered tag pill', () => {
    host.tagColor = 'primary';
    fixture.detectChanges();

    typeInto('ขนม,ไทย,');

    const pills: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.sic-tag__pill');
    expect(pills.length).toBe(2);
    pills.forEach((pill) => expect(pill.classList).toContain('sic-tag__pill--primary'));
  });

  it('commits the pending text as a tag on blur', () => {
    typeInto('ของหวาน');
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(getComponent().tags).toEqual(['ของหวาน']);
    expect(host.value).toBe('ของหวาน');
  });

  it('commits the pending text as a tag on Enter', () => {
    typeInto('ของหวาน');
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(getComponent().tags).toEqual(['ของหวาน']);
  });

  it('removes the last tag on Backspace when the input is empty', () => {
    typeInto('ขนม,ไทย,');
    expect(getComponent().tags).toEqual(['ขนม', 'ไทย']);

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(getComponent().tags).toEqual(['ขนม']);
    expect(host.value).toBe('ขนม');
  });

  it('removes a tag via its close button and updates the joined value', () => {
    typeInto('ขนม,ไทย,นำเข้า,');
    fixture.detectChanges();

    const closeButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.sic-tag__close');
    closeButtons[1].click();
    fixture.detectChanges();

    expect(getComponent().tags).toEqual(['ขนม', 'นำเข้า']);
    expect(host.value).toBe('ขนม,นำเข้า');
  });

  it('truncates a tag longer than maxTagLength', () => {
    host.maxTagLength = 3;
    fixture.detectChanges();

    typeInto('abcdef,');

    expect(getComponent().tags).toEqual(['abc']);
  });

  it('stops accepting new tags once maxTags is reached, disabling the input', () => {
    host.maxTags = 2;
    fixture.detectChanges();

    typeInto('a,b,c,');

    const cmp = getComponent();
    expect(cmp.tags).toEqual(['a', 'b']);
    expect(cmp.isAtMaxTags).toBe(true);
    expect(input().disabled).toBe(true);
  });
});

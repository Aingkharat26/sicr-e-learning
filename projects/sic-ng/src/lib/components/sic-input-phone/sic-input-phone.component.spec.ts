import { ApplicationRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicInputPhoneComponent } from './sic-input-phone.component';

@Component({
  standalone: true,
  imports: [FormsModule, SicInputPhoneComponent],
  template: `<sic-input-phone name="phone" [(ngModel)]="phone" />`,
})
class HostComponent {
  phone = '';
}

describe('SicInputPhoneComponent dropdown', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeAll(() => {
    // jsdom in this environment doesn't implement scrollIntoView at all (real
    // browsers always do) — stub it so tests can spy on/call through it.
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = () => {};
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    // Avoids leftover setTimeout callbacks (e.g. scrollActiveIntoView queued
    // by a still-open panel) leaking into and firing during a later test.
    fixture.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function getComponent(): SicInputPhoneComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicInputPhoneComponent)
      .componentInstance;
  }

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  it('closes the panel when selectCountry is called directly', () => {
    const cmp = getComponent();
    cmp.openPanel();
    fixture.detectChanges();
    expect(cmp.open).toBe(true);

    cmp.selectCountry(undefined, cmp.countries[0]);
    fixture.detectChanges();
    expect(cmp.open).toBe(false);
  });

  it('renders the option list in a CDK overlay attached to the body, not as an in-place absolutely-positioned child — so an ancestor with overflow:hidden (e.g. sic-card) never clips it', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-phone__dial-trigger');
    button.click();
    fixture.detectChanges();
    tick();

    expect(fixture.nativeElement.querySelector('.sic-input-phone__panel')).toBeNull();
    expect(document.querySelector('.cdk-overlay-pane .sic-input-phone__panel')).toBeTruthy();
  });

  it('closes the panel after clicking an option', () => {
    const cmp = getComponent();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-phone__dial-trigger');

    button.click();
    fixture.detectChanges();
    tick();
    expect(cmp.open).toBe(true);

    const option: HTMLLIElement = document.querySelector('.sic-input-phone__option')!;
    expect(option).toBeTruthy();

    option.click();
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
    expect(document.querySelector('.sic-input-phone__panel')).toBeNull();
  });

  it('does not close when clicking inside the panel but not on an option (e.g. list padding)', () => {
    const cmp = getComponent();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-phone__dial-trigger');

    button.click();
    fixture.detectChanges();
    tick();
    expect(cmp.open).toBe(true);

    const list: HTMLUListElement = document.querySelector('.sic-input-phone__options')!;
    list.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(cmp.open).toBe(true);
  });

  it('closes on a click outside both the host and the overlay panel', () => {
    const cmp = getComponent();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-phone__dial-trigger');

    button.click();
    fixture.detectChanges();
    tick();
    expect(cmp.open).toBe(true);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
  });

  it('focuses the dial trigger synchronously on first open so arrow keys work immediately', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-phone__dial-trigger');

    button.click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(button);
  });

  it('scrolls the active option into view on open, not just the top of the list', async () => {
    const cmp = getComponent();
    cmp.selectedCountryCode = 'ZW'; // last entry in the 240-country list
    const expectedIndex = cmp.countries.findIndex((c) => c.code === 'ZW');
    const scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {});

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-phone__dial-trigger');
    button.click();
    fixture.detectChanges();
    tick();
    await new Promise((resolve) => setTimeout(resolve));

    expect(scrollSpy).toHaveBeenCalled();
    const scrolledEl = scrollSpy.mock.instances.at(-1) as HTMLElement;
    const options = Array.from(document.querySelectorAll('.sic-input-phone__option'));
    expect(options.indexOf(scrolledEl)).toBe(expectedIndex);

    scrollSpy.mockRestore();
  });

  it('scrolls on ArrowDown/ArrowUp too', () => {
    const scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {});
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-phone__dial-trigger');

    button.click();
    fixture.detectChanges();
    tick();
    scrollSpy.mockClear();

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(scrollSpy).toHaveBeenCalled();
    scrollSpy.mockRestore();
  });

  it('moves activeIndex on ArrowDown/ArrowUp', () => {
    const cmp = getComponent();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-phone__dial-trigger');

    button.click();
    fixture.detectChanges();
    const startIndex = cmp.activeIndex;

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.activeIndex).toBe(startIndex + 1);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.activeIndex).toBe(startIndex);
  });
});

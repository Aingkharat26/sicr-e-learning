import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { sicWarnBeforeUnload } from './sic-warn-before-unload';

@Component({ standalone: true, template: '' })
class HostComponent {
  dirty = false;

  constructor() {
    sicWarnBeforeUnload(() => this.dirty);
  }
}

describe('sicWarnBeforeUnload', () => {
  let fixture: ComponentFixture<HostComponent>;
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addSpy = vi.spyOn(window, 'addEventListener');
    removeSpy = vi.spyOn(window, 'removeEventListener');

    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  function dispatchBeforeUnload(): Event {
    const event = new Event('beforeunload', { cancelable: true });
    Object.defineProperty(event, 'returnValue', { value: undefined, writable: true });
    window.dispatchEvent(event);
    return event;
  }

  it('registers a beforeunload listener on construction', () => {
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('does not prevent unload when the dirty callback returns false', () => {
    fixture.componentInstance.dirty = false;
    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(false);
  });

  it('prevents unload and sets returnValue when the dirty callback returns true', () => {
    fixture.componentInstance.dirty = true;
    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(true);
    expect((event as BeforeUnloadEvent).returnValue).toBe('');
  });

  it('removes its listener when the component is destroyed', () => {
    fixture.destroy();

    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});

describe('sicWarnBeforeUnload outside an injection context', () => {
  it('throws if not called from within an injection context', () => {
    expect(() => sicWarnBeforeUnload(() => true)).toThrow();
  });
});

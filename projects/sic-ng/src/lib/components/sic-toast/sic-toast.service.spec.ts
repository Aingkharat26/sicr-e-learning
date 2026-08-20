import { TestBed } from '@angular/core/testing';
import { SicToastService } from './sic-toast.service';

describe('SicToastService', () => {
  let service: SicToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SicToastService);
    service.clear();
  });

  it('supports the original (message, type, duration) call shape', () => {
    service.show('Saved', 'success', 0);

    const toast = service.toasts()[0];
    expect(toast.message).toBe('Saved');
    expect(toast.type).toBe('success');
    expect(toast.title).toBeUndefined();
  });

  it('defaults type to info and duration to 3500 for the shorthand form', () => {
    service.show('Hi');

    const toast = service.toasts()[0];
    expect(toast.type).toBe('info');
    expect(toast.duration).toBe(3500);
  });

  it('supports the richer options-object call shape with title/icon/badge', () => {
    service.show({
      title: 'Your complaint has been received',
      message: 'You will be notified as soon as it is processed by a moderator',
      type: 'success',
      duration: 0,
      badge: { text: '+500' },
    });

    const toast = service.toasts()[0];
    expect(toast.title).toBe('Your complaint has been received');
    expect(toast.badge).toEqual({ text: '+500' });
    expect(toast.type).toBe('success');
  });

  it('auto-dismisses after the given duration', () => {
    vi.useFakeTimers();
    service.show('Bye', 'info', 1000);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('never auto-dismisses when duration is 0', () => {
    vi.useFakeTimers();
    service.show('Stay', 'info', 0);
    vi.advanceTimersByTime(100000);

    expect(service.toasts().length).toBe(1);
    vi.useRealTimers();
  });
});

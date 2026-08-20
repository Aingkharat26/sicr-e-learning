import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicVideoPlayerComponent } from './sic-video-player.component';

describe('SicVideoPlayerComponent', () => {
  let fixture: ComponentFixture<SicVideoPlayerComponent>;
  let component: SicVideoPlayerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicVideoPlayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SicVideoPlayerComponent);
    component = fixture.componentInstance;
    component.src = 'https://example.com/video.mp4';
  });

  it('defaults the aspect ratio to 16 / 9 on the host', () => {
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.getPropertyValue('--sic-video-player-aspect-ratio')).toBe('16 / 9');
  });

  it('applies a custom aspect ratio on the host', () => {
    component.aspectRatio = '4 / 3';
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.getPropertyValue('--sic-video-player-aspect-ratio')).toBe('4 / 3');
  });

  it('shows a poster and a play-button overlay before playback starts', () => {
    component.poster = 'https://example.com/poster.jpg';
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const video = host.querySelector('video') as HTMLVideoElement;
    expect(video.getAttribute('poster')).toBe('https://example.com/poster.jpg');
    expect(video.getAttribute('preload')).toBe('none');
    expect(host.querySelector('.sic-video-player__play-btn')).toBeTruthy();
  });

  it('falls back to preload="metadata" when no poster is given', () => {
    fixture.detectChanges();

    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    expect(video.getAttribute('preload')).toBe('metadata');
  });

  it('hides the play-button overlay once playback starts, and shows it again once paused', () => {
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const video = host.querySelector('video') as HTMLVideoElement;

    video.dispatchEvent(new Event('play'));
    fixture.detectChanges();
    expect(host.querySelector('.sic-video-player__play-btn')).toBeNull();

    video.dispatchEvent(new Event('pause'));
    fixture.detectChanges();
    expect(host.querySelector('.sic-video-player__play-btn')).toBeTruthy();
  });

  it('togglePlay() calls video.play()/.pause() and flips `playing`', () => {
    fixture.detectChanges();
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    const playSpy = vi.spyOn(video, 'play').mockImplementation(() => Promise.resolve());
    const pauseSpy = vi.spyOn(video, 'pause').mockImplementation(() => {});
    Object.defineProperty(video, 'paused', { value: true, configurable: true });

    component.togglePlay();
    expect(playSpy).toHaveBeenCalled();
    expect(component.playing).toBe(true);

    Object.defineProperty(video, 'paused', { value: false, configurable: true });
    component.togglePlay();
    expect(pauseSpy).toHaveBeenCalled();
    expect(component.playing).toBe(false);
  });

  it('uses SIC_CONFIG.messages.playVideo for the play button aria-label, falling back to "Play video"', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-video-player__play-btn').getAttribute('aria-label')).toBe('Play video');
  });
});

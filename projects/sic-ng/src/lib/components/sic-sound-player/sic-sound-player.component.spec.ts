import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicSoundPlayerComponent } from './sic-sound-player.component';

describe('SicSoundPlayerComponent', () => {
  let fixture: ComponentFixture<SicSoundPlayerComponent>;
  let component: SicSoundPlayerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicSoundPlayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SicSoundPlayerComponent);
    component = fixture.componentInstance;
    component.src = 'https://example.com/track.mp3';
    component.title = 'My Delorean';
  });

  it('generates a waveform with the requested number of bars', () => {
    component.barsCount = 24;
    fixture.detectChanges();

    expect(component.bars.length).toBe(24);
  });

  it('formats current time and duration as mm:ss', () => {
    component.currentTime = 178;
    component.duration = 232;
    fixture.detectChanges();

    expect(component.formattedCurrentTime).toBe('2:58');
    expect(component.formattedDuration).toBe('3:52');
  });

  it('computes activeBarCount from progress', () => {
    component.barsCount = 10;
    fixture.detectChanges();
    component.currentTime = 5;
    component.duration = 10;

    expect(component.activeBarCount).toBe(5);
  });

  it('emits previousTrack/nextTrack', () => {
    fixture.detectChanges();

    const spies = {
      previousTrack: vi.fn(),
      nextTrack: vi.fn(),
    };
    component.previousTrack.subscribe(spies.previousTrack);
    component.nextTrack.subscribe(spies.nextTrack);

    component.previousTrack.emit();
    component.nextTrack.emit();

    expect(spies.previousTrack).toHaveBeenCalled();
    expect(spies.nextTrack).toHaveBeenCalled();
  });
});

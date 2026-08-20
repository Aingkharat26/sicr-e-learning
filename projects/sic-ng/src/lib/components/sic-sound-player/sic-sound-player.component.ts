import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';

/**
 * A compact album-style audio player card: cover art, title/subtitle, a clickable waveform
 * (seeks on click, fills to show playback progress), and transport controls (prev, play/pause,
 * next). Wraps a native `<audio>` element internally.
 */
@Component({
  selector: 'sic-sound-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-sound-player.component.html',
  styleUrl: './sic-sound-player.component.css',
})
export class SicSoundPlayerComponent {
  @Input({ required: true }) src!: string;
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() coverUrl?: string;
  /** Short genre/tag pill shown under the cover art (e.g. `'Synthwave'`). */
  @Input() genre?: string;
  /** Pre-formatted play-count text shown under the genre pill (e.g. `'1.2M plays'`). */
  @Input() plays?: string;
  @Input() autoplay = false;
  @Input() loop = false;
  @Input() muted = false;
  /** Number of bars drawn in the waveform. Default: 48. */
  @Input() barsCount = 48;

  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() ended = new EventEmitter<void>();
  @Output() timeUpdate = new EventEmitter<{ currentTime: number; duration: number }>();
  @Output() previousTrack = new EventEmitter<void>();
  @Output() nextTrack = new EventEmitter<void>();

  @ViewChild('audio') private audioRef?: ElementRef<HTMLAudioElement>;
  @ViewChild('waveform') private waveformRef?: ElementRef<HTMLDivElement>;

  @HostBinding('class.sic-sound-player-host') readonly hostClass = true;

  playing = false;
  currentTime = 0;
  duration = 0;

  get bars(): number[] {
    return generateWaveform(this.barsCount);
  }

  get progress(): number {
    return this.duration > 0 ? this.currentTime / this.duration : 0;
  }

  get activeBarCount(): number {
    return Math.round(this.progress * this.bars.length);
  }

  get formattedCurrentTime(): string {
    return formatTime(this.currentTime);
  }

  get formattedDuration(): string {
    return formatTime(this.duration);
  }

  togglePlay(): void {
    const audio = this.audioRef?.nativeElement;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  onPlay(): void {
    this.playing = true;
    this.play.emit();
  }

  onPause(): void {
    this.playing = false;
    this.pause.emit();
  }

  onEnded(): void {
    this.playing = false;
    this.ended.emit();
  }

  onLoadedMetadata(): void {
    this.duration = this.audioRef?.nativeElement.duration || 0;
  }

  onTimeUpdate(): void {
    this.currentTime = this.audioRef?.nativeElement.currentTime || 0;
    this.timeUpdate.emit({ currentTime: this.currentTime, duration: this.duration });
  }

  onWaveformClick(event: MouseEvent): void {
    const audio = this.audioRef?.nativeElement;
    const waveform = this.waveformRef?.nativeElement;
    if (!audio || !waveform || !this.duration) {
      return;
    }

    const rect = waveform.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * this.duration;
  }
}

function generateWaveform(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const wave = Math.sin(i * 0.5) * 0.3 + Math.sin(i * 1.3) * 0.2;
    const noise = Math.sin(i * 12.9898) * 0.5;
    bars.push(Math.round(Math.min(1, 0.35 + Math.abs(wave + noise * 0.15)) * 100));
  }
  return bars;
}

function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

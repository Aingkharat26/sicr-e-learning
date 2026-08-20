import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, Input, ViewChild } from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';

@Component({
  selector: 'sic-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-video-player.component.html',
  styleUrl: './sic-video-player.component.css',
})
export class SicVideoPlayerComponent {
  private readonly sicConfig = injectSicConfig();

  @Input({ required: true }) src!: string;
  /** Shown in place of the video until playback starts — without one, the browser has nothing to render but a black frame before the first play. */
  @Input() poster?: string;
  @Input() autoplay = false;
  @Input() loop = false;
  @Input() muted = false;
  /** Width/height ratio for the player, as a CSS `aspect-ratio` value (e.g. `'16 / 9'`, `'4 / 3'`). Width always fills the container; height is derived from this ratio. Default: `'16 / 9'`. */
  @Input() aspectRatio = '16 / 9';

  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;

  @HostBinding('class.sic-video-player-host') readonly hostClass = true;
  @HostBinding('style.--sic-video-player-aspect-ratio') get aspectRatioVar(): string {
    return this.aspectRatio;
  }

  playing = false;

  get playLabel(): string {
    return this.sicConfig.messages?.playVideo ?? 'Play video';
  }

  /**
   * When a poster is set, skip the browser's default eager video fetch so it can't race ahead and
   * swap the poster for a decoded frame before the user has actually pressed play. Without a
   * poster there's nothing to preview anyway, so 'metadata' is used to at least get a duration.
   */
  get preload(): 'none' | 'metadata' {
    return this.poster ? 'none' : 'metadata';
  }

  togglePlay(): void {
    const video = this.videoRef?.nativeElement;

    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
      this.playing = true;
    } else {
      video.pause();
      this.playing = false;
    }
  }
}

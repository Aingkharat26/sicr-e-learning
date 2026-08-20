import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

/** Accepts sic-flex's own shorthand keywords ('start'/'end'/'between'/...) as well as the raw CSS
 * values they map to ('flex-start'/'space-between'/...), since passing the literal CSS keyword by
 * habit is an easy mistake — silently falling through to `undefined` would strip the style
 * entirely instead of doing what was actually asked. */
export type SicFlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline' | 'flex-start' | 'flex-end';
export type SicFlexJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
  baseline: 'baseline',
  'flex-start': 'flex-start',
  'flex-end': 'flex-end',
};

const JUSTIFY_MAP: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  'flex-start': 'flex-start',
  'flex-end': 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

@Component({
  selector: 'sic-flex',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styleUrl: './sic-flex.component.css',
})
export class SicFlexComponent {
  @Input() direction: 'row' | 'column' | 'row-reverse' | 'column-reverse' = 'row';
  @Input() align: SicFlexAlign = 'stretch';
  @Input() justify: SicFlexJustify = 'start';
  @Input() wrap: 'nowrap' | 'wrap' | 'wrap-reverse' = 'nowrap';
  @Input() gap = '0';

  @HostBinding('style.display') readonly display = 'flex';
  @HostBinding('style.flex-direction') get flexDirection() {
    return this.direction;
  }
  @HostBinding('style.align-items') get alignItems() {
    return ALIGN_MAP[this.align] ?? this.align;
  }
  @HostBinding('style.justify-content') get justifyContent() {
    return JUSTIFY_MAP[this.justify] ?? this.justify;
  }
  @HostBinding('style.flex-wrap') get flexWrap() {
    return this.wrap;
  }
  @HostBinding('style.gap') get flexGap() {
    return this.gap;
  }
}

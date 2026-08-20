import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, Output, inject } from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import { SicButtonComponent } from '../sic-button/sic-button.component';
import { SicStepperStep } from './sic-stepper.model';

export type SicStepperOrientation = 'horizontal' | 'vertical';

/**
 * Step indicator + built-in Previous/Skip/Next/Finish nav, horizontal or vertical. Step *content*
 * is left to you (like sic-tabs) — put whatever you want to show for `activeIndex` as plain
 * `<ng-content>`, e.g. an `@switch (activeIndex)`.
 */
@Component({
  selector: 'sic-stepper',
  standalone: true,
  imports: [CommonModule, SicButtonComponent],
  templateUrl: './sic-stepper.component.html',
  styleUrl: './sic-stepper.component.css',
})
export class SicStepperComponent {
  private readonly sicConfig = injectSicConfig();
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() steps: SicStepperStep[] = [];
  @Input() activeIndex = 0;
  @Input() orientation: SicStepperOrientation = 'horizontal';
  /** Hides the built-in Previous/Skip/Next/Finish row — drive navigation yourself via `goTo()`/`goToPrevious()`/`goToNext()`/`skipStep()`/`finishStepper()`. */
  @Input() showNav = true;

  /** Fires whenever the active step changes — Previous/Next/Skip clicks, or clicking a step indicator directly. */
  @Output() activeIndexChange = new EventEmitter<number>();
  /** Fires (alongside activeIndexChange) specifically when the "Skip" button is clicked, with the index of the step that was skipped. */
  @Output() skip = new EventEmitter<number>();
  /** Fires when "Finish" is clicked on the last step. Doesn't change activeIndex on its own. */
  @Output() finish = new EventEmitter<void>();

  @HostBinding('class.sic-stepper-host') readonly hostClass = true;
  @HostBinding('class.sic-stepper--vertical') get isVertical(): boolean {
    return this.orientation === 'vertical';
  }

  get isFirst(): boolean {
    return this.activeIndex <= 0;
  }

  get isLast(): boolean {
    return this.activeIndex >= this.steps.length - 1;
  }

  get currentStep(): SicStepperStep | undefined {
    return this.steps[this.activeIndex];
  }

  get previousText(): string {
    return this.sicConfig.messages?.stepperPrevious ?? 'Previous';
  }

  get nextText(): string {
    return this.sicConfig.messages?.stepperNext ?? 'Next';
  }

  get skipText(): string {
    return this.sicConfig.messages?.stepperSkip ?? 'Skip';
  }

  get finishText(): string {
    return this.sicConfig.messages?.stepperFinish ?? 'Finish';
  }

  stepState(index: number): 'complete' | 'active' | 'upcoming' {
    if (index < this.activeIndex) {
      return 'complete';
    }
    return index === this.activeIndex ? 'active' : 'upcoming';
  }

  goTo(index: number): void {
    if (index === this.activeIndex || index < 0 || index >= this.steps.length || this.steps[index]?.disabled) {
      return;
    }

    this.activeIndex = index;
    this.cdr.markForCheck();
    this.activeIndexChange.emit(index);
  }

  goToPrevious(): void {
    if (this.isFirst) {
      return;
    }

    this.goTo(this.activeIndex - 1);
  }

  goToNext(): void {
    if (this.isLast) {
      return;
    }

    this.goTo(this.activeIndex + 1);
  }

  skipStep(): void {
    if (this.isLast) {
      return;
    }

    const skipped = this.activeIndex;
    this.activeIndex += 1;
    this.cdr.markForCheck();
    this.skip.emit(skipped);
    this.activeIndexChange.emit(this.activeIndex);
  }

  finishStepper(): void {
    this.finish.emit();
  }
}

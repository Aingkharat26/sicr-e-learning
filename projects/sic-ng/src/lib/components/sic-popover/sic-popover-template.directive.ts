import { Directive } from '@angular/core';

/** Template context handed to the button/header/footer slot overrides: `let-popover="$implicit"`. */
export interface SicPopoverTemplateContext {
  $implicit: unknown;
  open: boolean;
}

/** Template context handed to each rendered row: `let-item let-index="index"`. */
export interface SicPopoverItemContext<T> {
  $implicit: T;
  index: number;
}

/** Wrap custom markup with `<ng-template sicPopoverButton let-popover>` to replace the default "⋯" trigger button — call `popover.toggle()` yourself. */
@Directive({ selector: '[sicPopoverButton]', standalone: true })
export class SicPopoverButtonDirective {}

/** Wrap custom markup with `<ng-template sicPopoverHeader let-popover>` — the panel has no built-in header, so this is the only way to render one. */
@Directive({ selector: '[sicPopoverHeader]', standalone: true })
export class SicPopoverHeaderDirective {}

/** Wrap custom markup with `<ng-template sicPopoverList let-item let-index="index">` to replace how each item in `items` renders. */
@Directive({ selector: '[sicPopoverList]', standalone: true })
export class SicPopoverListDirective {}

/** Wrap custom markup with `<ng-template sicPopoverFooter let-popover>` — the panel has no built-in footer, so this is the only way to render one. */
@Directive({ selector: '[sicPopoverFooter]', standalone: true })
export class SicPopoverFooterDirective {}

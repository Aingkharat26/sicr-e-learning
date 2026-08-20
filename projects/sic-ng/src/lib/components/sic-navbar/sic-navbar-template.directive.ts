import { Directive } from '@angular/core';

/** Template context handed to every `sic-navbar` slot override: `let-navbar` for the component instance. */
export interface SicNavbarTemplateContext {
  $implicit: unknown;
}

/** Wrap custom markup with `<ng-template sicNavbarHeader let-navbar>` to replace the brand/header slot. */
@Directive({ selector: '[sicNavbarHeader]', standalone: true })
export class SicNavbarHeaderDirective {}

/** Wrap custom markup with `<ng-template sicNavbarLeft let-navbar>` to replace the sidebar-toggle row. */
@Directive({ selector: '[sicNavbarLeft]', standalone: true })
export class SicNavbarLeftDirective {}

/** Wrap custom markup with `<ng-template sicNavbarRight let-navbar>` to replace the theme/notifications/user row. */
@Directive({ selector: '[sicNavbarRight]', standalone: true })
export class SicNavbarRightDirective {}

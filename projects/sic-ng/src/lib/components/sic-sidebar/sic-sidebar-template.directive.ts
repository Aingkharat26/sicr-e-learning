import { Directive } from '@angular/core';

/** Template context handed to every `sic-sidebar` slot override: `let-collapsed="collapsed"` etc. */
export interface SicSidebarTemplateContext {
  $implicit: unknown;
  collapsed: boolean;
  expanded: boolean;
}

/** Wrap custom header markup with `<ng-template sicSidebarHeader>` to replace the logo/brand row. */
@Directive({ selector: '[sicSidebarHeader]', standalone: true })
export class SicSidebarHeaderDirective {}

/** Wrap custom markup with `<ng-template sicSidebarSubheader>` to replace the search row. */
@Directive({ selector: '[sicSidebarSubheader]', standalone: true })
export class SicSidebarSubheaderDirective {}

/** Wrap custom markup with `<ng-template sicSidebarMenu>` to replace the whole nav/sections list. */
@Directive({ selector: '[sicSidebarMenu]', standalone: true })
export class SicSidebarMenuDirective {}

/** Wrap custom markup with `<ng-template sicSidebarFooter>` to replace the theme-toggle/user card row. */
@Directive({ selector: '[sicSidebarFooter]', standalone: true })
export class SicSidebarFooterDirective {}

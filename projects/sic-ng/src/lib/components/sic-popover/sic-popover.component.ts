import { CommonModule } from '@angular/common';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import {
  SicPopoverButtonDirective,
  SicPopoverFooterDirective,
  SicPopoverHeaderDirective,
  SicPopoverItemContext,
  SicPopoverListDirective,
  SicPopoverTemplateContext,
} from './sic-popover-template.directive';

export type SicPopoverPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

const POSITIONS: Record<SicPopoverPlacement, ConnectedPosition> = {
  'bottom-start': { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
  'bottom-end': { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
  'top-start': { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  'top-end': { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
};

/**
 * A generic popover: a trigger button that opens a connected overlay panel showing `items` as a
 * list. Closes on Escape or a backdrop click. Every part is swappable — provide
 * `<ng-template sicPopoverButton>`/`sicPopoverHeader`/`sicPopoverList`/`sicPopoverFooter` to
 * customize the trigger, panel header, per-item rendering, and panel footer respectively.
 */
@Component({
  selector: 'sic-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-popover.component.html',
  styleUrl: './sic-popover.component.css',
})
export class SicPopoverComponent<T = unknown> implements OnChanges, OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly sicConfig = injectSicConfig();
  /**
   * The overlay anchors to the host element itself (not a `@ViewChild` wrapper inside the
   * template) — `:host` is given real `inline-flex` geometry in the stylesheet specifically so
   * this always has a genuine, immediately-available bounding rect to position against. An
   * earlier version anchored to a `display: contents` wrapper div instead, which has no box of
   * its own (`getBoundingClientRect()` returns a zero-size rect at the origin), sending the panel
   * to the top-left of the page instead of next to the trigger.
   */
  private readonly hostElementRef = inject(ElementRef<HTMLElement>);

  @Input() items: T[] = [];
  @Input() open = false;
  @Input() closeOnSelect = true;
  @Input() placement: SicPopoverPlacement = 'bottom-start';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() itemSelect = new EventEmitter<T>();

  /** Custom `<ng-template sicPopoverButton let-popover>` replaces the default "⋯" trigger button — call `popover.toggle()` yourself. */
  @ContentChild(SicPopoverButtonDirective, { read: TemplateRef }) buttonTemplate?: TemplateRef<SicPopoverTemplateContext>;
  /** `<ng-template sicPopoverHeader let-popover>` — the panel has no built-in header, so this is the only way to render one. */
  @ContentChild(SicPopoverHeaderDirective, { read: TemplateRef }) headerTemplate?: TemplateRef<SicPopoverTemplateContext>;
  /** `<ng-template sicPopoverList let-item let-index="index">` overrides how each item in `items` renders. */
  @ContentChild(SicPopoverListDirective, { read: TemplateRef }) listTemplate?: TemplateRef<SicPopoverItemContext<T>>;
  /** `<ng-template sicPopoverFooter let-popover>` — the panel has no built-in footer, so this is the only way to render one. */
  @ContentChild(SicPopoverFooterDirective, { read: TemplateRef }) footerTemplate?: TemplateRef<SicPopoverTemplateContext>;

  @ViewChild('panelTemplate', { static: true }) private readonly panelTemplateRef!: TemplateRef<unknown>;

  private overlayRef?: OverlayRef;

  get templateContext(): SicPopoverTemplateContext {
    return { $implicit: this, open: this.open };
  }

  get noItemsText(): string {
    return this.sicConfig.messages?.noItems ?? 'No items';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) {
      return;
    }

    if (this.open) {
      this.openOverlay();
    } else {
      this.closeOverlay();
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }

  @HostListener('document:keydown.escape')
  onDocumentEscape(): void {
    this.close();
  }

  toggle(): void {
    if (this.open) {
      this.close();
    } else {
      this.openSelf();
    }
  }

  close(): void {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.openChange.emit(false);
    this.closeOverlay();
  }

  selectItem(item: T): void {
    this.itemSelect.emit(item);

    if (this.closeOnSelect) {
      this.close();
    }
  }

  private openSelf(): void {
    if (this.open) {
      return;
    }

    this.open = true;
    this.openChange.emit(true);
    this.openOverlay();
  }

  private openOverlay(): void {
    if (this.overlayRef) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.hostElementRef)
      .withPositions([POSITIONS[this.placement], ...Object.values(POSITIONS)]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.overlayRef.attach(new TemplatePortal(this.panelTemplateRef, this.viewContainerRef));
    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  private closeOverlay(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}

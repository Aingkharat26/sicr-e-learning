/*
 * Public API Surface of sic-ng
 */

// Shared infrastructure
export * from './lib/base/sic-form-control.base';
export * from './lib/validator/sic.validator';
export * from './lib/theme/theme.config';
export * from './lib/theme/theme.fonts';
export * from './lib/theme/theme.service';
export * from './lib/theme/provide-sic-theme';
export * from './lib/config/sic-config';
export * from './lib/form/sic-entity-state';
export * from './lib/form/sic-form-data';
export * from './lib/form/sic-form-combine';
export * from './lib/form/form.type';
export * from './lib/guards/sic-can-deactivate.guard';
export * from './lib/guards/sic-warn-before-unload';

// Data Entry / Inputs
export * from './lib/components/sic-input/sic-input.component';
export * from './lib/components/sic-input-password/sic-input-password.component';
export * from './lib/components/sic-input-number/sic-input-number.component';
export * from './lib/components/sic-input-area/sic-input-area.component';
export * from './lib/components/sic-input-comment/sic-input-comment.component';
export * from './lib/components/sic-input-phone/sic-input-phone.component';
export * from './lib/components/sic-input-tag/sic-input-tag.component';
export * from './lib/components/sic-combobox/sic-combobox.component';
export * from './lib/components/sic-checkbox/sic-checkbox.component';
export * from './lib/components/sic-radio/sic-radio.component';
export * from './lib/components/sic-switch/sic-switch.component';
export * from './lib/components/sic-range/sic-range.component';
export * from './lib/components/sic-datepicker/sic-datepicker.component';
export * from './lib/components/sic-timepicker/sic-timepicker.component';
export * from './lib/components/sic-colorpicker/sic-colorpicker.component';
export * from './lib/components/sic-upload/sic-upload.component';
export * from './lib/components/sic-rating/sic-rating.component';

// General / Buttons
export * from './lib/components/sic-flex/sic-flex.component';
export * from './lib/components/sic-grid/sic-grid.component';
export * from './lib/components/sic-card/sic-card.component';
export * from './lib/components/sic-button/sic-button.component';
export * from './lib/components/sic-a-link/sic-a-link.component';
export * from './lib/components/sic-button-group/sic-button-group.component';
export * from './lib/components/sic-section/sic-section.component';
export * from './lib/components/sic-show/sic-show.component';
export * from './lib/components/sic-text/sic-text.component';
export * from './lib/components/sic-icon-badge/sic-icon-badge.component';

// Navigation
export * from './lib/components/sic-navbar/sic-navbar.component';
export * from './lib/components/sic-navbar/sic-navbar.model';
export * from './lib/components/sic-navbar/sic-navbar-template.directive';
export * from './lib/components/sic-sidebar/sic-sidebar.component';
export * from './lib/components/sic-sidebar/sic-sidebar.model';
export * from './lib/components/sic-sidebar/sic-sidebar-template.directive';
export * from './lib/components/sic-tabs/sic-tabs.component';
export * from './lib/components/sic-stepper/sic-stepper.component';
export * from './lib/components/sic-stepper/sic-stepper.model';
export * from './lib/components/sic-timeline/sic-timeline.component';
export * from './lib/components/sic-timeline/sic-timeline.model';
export * from './lib/components/sic-breadcrumb/sic-breadcrumb.component';

// Data Display & Media
export * from './lib/components/sic-gridpanel/sic-gridpanel.component';
export * from './lib/components/sic-calendar/sic-calendar.component';
export * from './lib/components/sic-code/sic-code.component';
export * from './lib/components/sic-code/sic-code-highlight';
export * from './lib/components/sic-calendar-timeline/sic-calendar-timeline.component';
export * from './lib/components/sic-calendar-timeline/sic-calendar-timeline.model';
export * from './lib/components/sic-image/sic-image.component';
export * from './lib/components/sic-image-slider/sic-image-slider.component';
export * from './lib/components/sic-image-slider/sic-image-slider.model';
export * from './lib/components/sic-sound-player/sic-sound-player.component';
export * from './lib/components/sic-video-player/sic-video-player.component';
export * from './lib/components/sic-masonry/sic-masonry.component';
export * from './lib/components/sic-drag-drop/sic-drag-drop.component';
export * from './lib/components/sic-drag-drop/sic-drag-drop.model';
export * from './lib/components/sic-card-stack/sic-card-stack.component';
export * from './lib/components/sic-card-stack/sic-card-stack.model';
export * from './lib/components/sic-badge/sic-badge.component';
export * from './lib/components/sic-tag/sic-tag.component';
export * from './lib/components/sic-avatar/sic-avatar.component';
export * from './lib/components/sic-accordion/sic-accordion.component';
export * from './lib/components/sic-collapse/sic-collapse.component';

// Overlays & Feedback
export * from './lib/components/sic-dialog/sic-dialog.component';
export * from './lib/components/sic-dialog/sic-dialog.service';
export * from './lib/components/sic-dialog/sic-common-dialog.component';
export * from './lib/components/sic-dialog/sic-dialog-panel.component';
export * from './lib/components/sic-loading/sic-loading-overlay.component';
export * from './lib/components/sic-loading/sic-loading.service';
export * from './lib/components/sic-toast/sic-toast.component';
export * from './lib/components/sic-toast/sic-toast.service';
export * from './lib/components/sic-tooltip/sic-tooltip.component';
export * from './lib/components/sic-tooltip/sic-tooltip.directive';
export * from './lib/components/sic-search/sic-search.component';
export * from './lib/components/sic-popover/sic-popover.component';
export * from './lib/components/sic-popover/sic-popover-template.directive';

// Loading / Indicators
export * from './lib/components/sic-spinner/sic-spinner.component';
export * from './lib/components/sic-skeleton/sic-skeleton.component';
export * from './lib/components/sic-progress-bar/sic-progress-bar.component';

// Decorative / Backgrounds
export * from './lib/components/sic-space-bg/sic-space-bg.component';
export * from './lib/components/sic-space-bg/sic-space-bg.model';


export * from './lib/tutorial/tutorial-page.component';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  forwardRef,
  inject,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase, SicTextAlign } from '../../base/sic-form-control.base';

const PHONE_PANEL_OVERLAY_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

export interface SicPhoneCountry {
  code: string;
  dialCode: string;
  name: string;
}

/** ISO 3166-1 alpha-2 → international calling code, sourced from countrycode.org. */
export const SIC_DEFAULT_PHONE_COUNTRIES: SicPhoneCountry[] = [
  { code: 'AF', dialCode: '+93', name: 'Afghanistan' },
  { code: 'AL', dialCode: '+355', name: 'Albania' },
  { code: 'DZ', dialCode: '+213', name: 'Algeria' },
  { code: 'AS', dialCode: '+1', name: 'American Samoa' },
  { code: 'AD', dialCode: '+376', name: 'Andorra' },
  { code: 'AO', dialCode: '+244', name: 'Angola' },
  { code: 'AI', dialCode: '+1', name: 'Anguilla' },
  { code: 'AQ', dialCode: '+672', name: 'Antarctica' },
  { code: 'AG', dialCode: '+1', name: 'Antigua and Barbuda' },
  { code: 'AR', dialCode: '+54', name: 'Argentina' },
  { code: 'AM', dialCode: '+374', name: 'Armenia' },
  { code: 'AW', dialCode: '+297', name: 'Aruba' },
  { code: 'AU', dialCode: '+61', name: 'Australia' },
  { code: 'AT', dialCode: '+43', name: 'Austria' },
  { code: 'AZ', dialCode: '+994', name: 'Azerbaijan' },
  { code: 'BS', dialCode: '+1', name: 'Bahamas' },
  { code: 'BH', dialCode: '+973', name: 'Bahrain' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
  { code: 'BB', dialCode: '+1', name: 'Barbados' },
  { code: 'BY', dialCode: '+375', name: 'Belarus' },
  { code: 'BE', dialCode: '+32', name: 'Belgium' },
  { code: 'BZ', dialCode: '+501', name: 'Belize' },
  { code: 'BJ', dialCode: '+229', name: 'Benin' },
  { code: 'BM', dialCode: '+1', name: 'Bermuda' },
  { code: 'BT', dialCode: '+975', name: 'Bhutan' },
  { code: 'BO', dialCode: '+591', name: 'Bolivia' },
  { code: 'BA', dialCode: '+387', name: 'Bosnia and Herzegovina' },
  { code: 'BW', dialCode: '+267', name: 'Botswana' },
  { code: 'BR', dialCode: '+55', name: 'Brazil' },
  { code: 'IO', dialCode: '+246', name: 'British Indian Ocean Territory' },
  { code: 'VG', dialCode: '+1', name: 'British Virgin Islands' },
  { code: 'BN', dialCode: '+673', name: 'Brunei' },
  { code: 'BG', dialCode: '+359', name: 'Bulgaria' },
  { code: 'BF', dialCode: '+226', name: 'Burkina Faso' },
  { code: 'BI', dialCode: '+257', name: 'Burundi' },
  { code: 'KH', dialCode: '+855', name: 'Cambodia' },
  { code: 'CM', dialCode: '+237', name: 'Cameroon' },
  { code: 'CA', dialCode: '+1', name: 'Canada' },
  { code: 'CV', dialCode: '+238', name: 'Cape Verde' },
  { code: 'KY', dialCode: '+1', name: 'Cayman Islands' },
  { code: 'CF', dialCode: '+236', name: 'Central African Republic' },
  { code: 'TD', dialCode: '+235', name: 'Chad' },
  { code: 'CL', dialCode: '+56', name: 'Chile' },
  { code: 'CN', dialCode: '+86', name: 'China' },
  { code: 'CX', dialCode: '+61', name: 'Christmas Island' },
  { code: 'CC', dialCode: '+61', name: 'Cocos Islands' },
  { code: 'CO', dialCode: '+57', name: 'Colombia' },
  { code: 'KM', dialCode: '+269', name: 'Comoros' },
  { code: 'CK', dialCode: '+682', name: 'Cook Islands' },
  { code: 'CR', dialCode: '+506', name: 'Costa Rica' },
  { code: 'HR', dialCode: '+385', name: 'Croatia' },
  { code: 'CU', dialCode: '+53', name: 'Cuba' },
  { code: 'CW', dialCode: '+599', name: 'Curacao' },
  { code: 'CY', dialCode: '+357', name: 'Cyprus' },
  { code: 'CZ', dialCode: '+420', name: 'Czech Republic' },
  { code: 'CD', dialCode: '+243', name: 'Democratic Republic of the Congo' },
  { code: 'DK', dialCode: '+45', name: 'Denmark' },
  { code: 'DJ', dialCode: '+253', name: 'Djibouti' },
  { code: 'DM', dialCode: '+1', name: 'Dominica' },
  { code: 'DO', dialCode: '+1', name: 'Dominican Republic' },
  { code: 'TL', dialCode: '+670', name: 'East Timor' },
  { code: 'EC', dialCode: '+593', name: 'Ecuador' },
  { code: 'EG', dialCode: '+20', name: 'Egypt' },
  { code: 'SV', dialCode: '+503', name: 'El Salvador' },
  { code: 'GQ', dialCode: '+240', name: 'Equatorial Guinea' },
  { code: 'ER', dialCode: '+291', name: 'Eritrea' },
  { code: 'EE', dialCode: '+372', name: 'Estonia' },
  { code: 'ET', dialCode: '+251', name: 'Ethiopia' },
  { code: 'FK', dialCode: '+500', name: 'Falkland Islands' },
  { code: 'FO', dialCode: '+298', name: 'Faroe Islands' },
  { code: 'FJ', dialCode: '+679', name: 'Fiji' },
  { code: 'FI', dialCode: '+358', name: 'Finland' },
  { code: 'FR', dialCode: '+33', name: 'France' },
  { code: 'PF', dialCode: '+689', name: 'French Polynesia' },
  { code: 'GA', dialCode: '+241', name: 'Gabon' },
  { code: 'GM', dialCode: '+220', name: 'Gambia' },
  { code: 'GE', dialCode: '+995', name: 'Georgia' },
  { code: 'DE', dialCode: '+49', name: 'Germany' },
  { code: 'GH', dialCode: '+233', name: 'Ghana' },
  { code: 'GI', dialCode: '+350', name: 'Gibraltar' },
  { code: 'GR', dialCode: '+30', name: 'Greece' },
  { code: 'GL', dialCode: '+299', name: 'Greenland' },
  { code: 'GD', dialCode: '+1', name: 'Grenada' },
  { code: 'GU', dialCode: '+1', name: 'Guam' },
  { code: 'GT', dialCode: '+502', name: 'Guatemala' },
  { code: 'GG', dialCode: '+44', name: 'Guernsey' },
  { code: 'GN', dialCode: '+224', name: 'Guinea' },
  { code: 'GW', dialCode: '+245', name: 'Guinea-Bissau' },
  { code: 'GY', dialCode: '+592', name: 'Guyana' },
  { code: 'HT', dialCode: '+509', name: 'Haiti' },
  { code: 'HN', dialCode: '+504', name: 'Honduras' },
  { code: 'HK', dialCode: '+852', name: 'Hong Kong' },
  { code: 'HU', dialCode: '+36', name: 'Hungary' },
  { code: 'IS', dialCode: '+354', name: 'Iceland' },
  { code: 'IN', dialCode: '+91', name: 'India' },
  { code: 'ID', dialCode: '+62', name: 'Indonesia' },
  { code: 'IR', dialCode: '+98', name: 'Iran' },
  { code: 'IQ', dialCode: '+964', name: 'Iraq' },
  { code: 'IE', dialCode: '+353', name: 'Ireland' },
  { code: 'IM', dialCode: '+44', name: 'Isle of Man' },
  { code: 'IL', dialCode: '+972', name: 'Israel' },
  { code: 'IT', dialCode: '+39', name: 'Italy' },
  { code: 'CI', dialCode: '+225', name: 'Ivory Coast' },
  { code: 'JM', dialCode: '+1', name: 'Jamaica' },
  { code: 'JP', dialCode: '+81', name: 'Japan' },
  { code: 'JE', dialCode: '+44', name: 'Jersey' },
  { code: 'JO', dialCode: '+962', name: 'Jordan' },
  { code: 'KZ', dialCode: '+7', name: 'Kazakhstan' },
  { code: 'KE', dialCode: '+254', name: 'Kenya' },
  { code: 'KI', dialCode: '+686', name: 'Kiribati' },
  { code: 'XK', dialCode: '+383', name: 'Kosovo' },
  { code: 'KW', dialCode: '+965', name: 'Kuwait' },
  { code: 'KG', dialCode: '+996', name: 'Kyrgyzstan' },
  { code: 'LA', dialCode: '+856', name: 'Laos' },
  { code: 'LV', dialCode: '+371', name: 'Latvia' },
  { code: 'LB', dialCode: '+961', name: 'Lebanon' },
  { code: 'LS', dialCode: '+266', name: 'Lesotho' },
  { code: 'LR', dialCode: '+231', name: 'Liberia' },
  { code: 'LY', dialCode: '+218', name: 'Libya' },
  { code: 'LI', dialCode: '+423', name: 'Liechtenstein' },
  { code: 'LT', dialCode: '+370', name: 'Lithuania' },
  { code: 'LU', dialCode: '+352', name: 'Luxembourg' },
  { code: 'MO', dialCode: '+853', name: 'Macau' },
  { code: 'MK', dialCode: '+389', name: 'Macedonia' },
  { code: 'MG', dialCode: '+261', name: 'Madagascar' },
  { code: 'MW', dialCode: '+265', name: 'Malawi' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia' },
  { code: 'MV', dialCode: '+960', name: 'Maldives' },
  { code: 'ML', dialCode: '+223', name: 'Mali' },
  { code: 'MT', dialCode: '+356', name: 'Malta' },
  { code: 'MH', dialCode: '+692', name: 'Marshall Islands' },
  { code: 'MR', dialCode: '+222', name: 'Mauritania' },
  { code: 'MU', dialCode: '+230', name: 'Mauritius' },
  { code: 'YT', dialCode: '+262', name: 'Mayotte' },
  { code: 'MX', dialCode: '+52', name: 'Mexico' },
  { code: 'FM', dialCode: '+691', name: 'Micronesia' },
  { code: 'MD', dialCode: '+373', name: 'Moldova' },
  { code: 'MC', dialCode: '+377', name: 'Monaco' },
  { code: 'MN', dialCode: '+976', name: 'Mongolia' },
  { code: 'ME', dialCode: '+382', name: 'Montenegro' },
  { code: 'MS', dialCode: '+1', name: 'Montserrat' },
  { code: 'MA', dialCode: '+212', name: 'Morocco' },
  { code: 'MZ', dialCode: '+258', name: 'Mozambique' },
  { code: 'MM', dialCode: '+95', name: 'Myanmar' },
  { code: 'NA', dialCode: '+264', name: 'Namibia' },
  { code: 'NR', dialCode: '+674', name: 'Nauru' },
  { code: 'NP', dialCode: '+977', name: 'Nepal' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands' },
  { code: 'AN', dialCode: '+599', name: 'Netherlands Antilles' },
  { code: 'NC', dialCode: '+687', name: 'New Caledonia' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand' },
  { code: 'NI', dialCode: '+505', name: 'Nicaragua' },
  { code: 'NE', dialCode: '+227', name: 'Niger' },
  { code: 'NG', dialCode: '+234', name: 'Nigeria' },
  { code: 'NU', dialCode: '+683', name: 'Niue' },
  { code: 'KP', dialCode: '+850', name: 'North Korea' },
  { code: 'MP', dialCode: '+1', name: 'Northern Mariana Islands' },
  { code: 'NO', dialCode: '+47', name: 'Norway' },
  { code: 'OM', dialCode: '+968', name: 'Oman' },
  { code: 'PK', dialCode: '+92', name: 'Pakistan' },
  { code: 'PW', dialCode: '+680', name: 'Palau' },
  { code: 'PS', dialCode: '+970', name: 'Palestine' },
  { code: 'PA', dialCode: '+507', name: 'Panama' },
  { code: 'PG', dialCode: '+675', name: 'Papua New Guinea' },
  { code: 'PY', dialCode: '+595', name: 'Paraguay' },
  { code: 'PE', dialCode: '+51', name: 'Peru' },
  { code: 'PH', dialCode: '+63', name: 'Philippines' },
  { code: 'PN', dialCode: '+64', name: 'Pitcairn' },
  { code: 'PL', dialCode: '+48', name: 'Poland' },
  { code: 'PT', dialCode: '+351', name: 'Portugal' },
  { code: 'PR', dialCode: '+1', name: 'Puerto Rico' },
  { code: 'QA', dialCode: '+974', name: 'Qatar' },
  { code: 'CG', dialCode: '+242', name: 'Republic of the Congo' },
  { code: 'RE', dialCode: '+262', name: 'Reunion' },
  { code: 'RO', dialCode: '+40', name: 'Romania' },
  { code: 'RU', dialCode: '+7', name: 'Russia' },
  { code: 'RW', dialCode: '+250', name: 'Rwanda' },
  { code: 'BL', dialCode: '+590', name: 'Saint Barthelemy' },
  { code: 'SH', dialCode: '+290', name: 'Saint Helena' },
  { code: 'KN', dialCode: '+1', name: 'Saint Kitts and Nevis' },
  { code: 'LC', dialCode: '+1', name: 'Saint Lucia' },
  { code: 'MF', dialCode: '+590', name: 'Saint Martin' },
  { code: 'PM', dialCode: '+508', name: 'Saint Pierre and Miquelon' },
  { code: 'VC', dialCode: '+1', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', dialCode: '+685', name: 'Samoa' },
  { code: 'SM', dialCode: '+378', name: 'San Marino' },
  { code: 'ST', dialCode: '+239', name: 'Sao Tome and Principe' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia' },
  { code: 'SN', dialCode: '+221', name: 'Senegal' },
  { code: 'RS', dialCode: '+381', name: 'Serbia' },
  { code: 'SC', dialCode: '+248', name: 'Seychelles' },
  { code: 'SL', dialCode: '+232', name: 'Sierra Leone' },
  { code: 'SG', dialCode: '+65', name: 'Singapore' },
  { code: 'SX', dialCode: '+1', name: 'Sint Maarten' },
  { code: 'SK', dialCode: '+421', name: 'Slovakia' },
  { code: 'SI', dialCode: '+386', name: 'Slovenia' },
  { code: 'SB', dialCode: '+677', name: 'Solomon Islands' },
  { code: 'SO', dialCode: '+252', name: 'Somalia' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa' },
  { code: 'KR', dialCode: '+82', name: 'South Korea' },
  { code: 'SS', dialCode: '+211', name: 'South Sudan' },
  { code: 'ES', dialCode: '+34', name: 'Spain' },
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
  { code: 'SD', dialCode: '+249', name: 'Sudan' },
  { code: 'SR', dialCode: '+597', name: 'Suriname' },
  { code: 'SJ', dialCode: '+47', name: 'Svalbard and Jan Mayen' },
  { code: 'SZ', dialCode: '+268', name: 'Swaziland' },
  { code: 'SE', dialCode: '+46', name: 'Sweden' },
  { code: 'CH', dialCode: '+41', name: 'Switzerland' },
  { code: 'SY', dialCode: '+963', name: 'Syria' },
  { code: 'TW', dialCode: '+886', name: 'Taiwan' },
  { code: 'TJ', dialCode: '+992', name: 'Tajikistan' },
  { code: 'TZ', dialCode: '+255', name: 'Tanzania' },
  { code: 'TH', dialCode: '+66', name: 'Thailand' },
  { code: 'TG', dialCode: '+228', name: 'Togo' },
  { code: 'TK', dialCode: '+690', name: 'Tokelau' },
  { code: 'TO', dialCode: '+676', name: 'Tonga' },
  { code: 'TT', dialCode: '+1', name: 'Trinidad and Tobago' },
  { code: 'TN', dialCode: '+216', name: 'Tunisia' },
  { code: 'TR', dialCode: '+90', name: 'Turkey' },
  { code: 'TM', dialCode: '+993', name: 'Turkmenistan' },
  { code: 'TC', dialCode: '+1', name: 'Turks and Caicos Islands' },
  { code: 'TV', dialCode: '+688', name: 'Tuvalu' },
  { code: 'VI', dialCode: '+1', name: 'U.S. Virgin Islands' },
  { code: 'UG', dialCode: '+256', name: 'Uganda' },
  { code: 'UA', dialCode: '+380', name: 'Ukraine' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom' },
  { code: 'US', dialCode: '+1', name: 'United States' },
  { code: 'UY', dialCode: '+598', name: 'Uruguay' },
  { code: 'UZ', dialCode: '+998', name: 'Uzbekistan' },
  { code: 'VU', dialCode: '+678', name: 'Vanuatu' },
  { code: 'VA', dialCode: '+379', name: 'Vatican' },
  { code: 'VE', dialCode: '+58', name: 'Venezuela' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam' },
  { code: 'WF', dialCode: '+681', name: 'Wallis and Futuna' },
  { code: 'EH', dialCode: '+212', name: 'Western Sahara' },
  { code: 'YE', dialCode: '+967', name: 'Yemen' },
  { code: 'ZM', dialCode: '+260', name: 'Zambia' },
  { code: 'ZW', dialCode: '+263', name: 'Zimbabwe' },
];

let nextFieldId = 0;

@Component({
  selector: 'sic-input-phone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input-phone.component.html',
  styleUrl: './sic-input-phone.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputPhoneComponent),
      multi: true,
    },
  ],
})
export class SicInputPhoneComponent extends SicFormControlBase<string> {
  @Input() name?: string;
  @Input() placeholder = '';
  @Input() countries: SicPhoneCountry[] = SIC_DEFAULT_PHONE_COUNTRIES;
  @Input() align: SicTextAlign = 'left';

  @HostBinding('class.sic-input-phone-host') readonly hostClass = true;
  @HostBinding('class.sic-align-center') get isAlignCenter(): boolean {
    return this.align === 'center';
  }
  @HostBinding('class.sic-align-right') get isAlignRight(): boolean {
    return this.align === 'right';
  }

  @ViewChild('phoneField') private phoneFieldRef?: ElementRef<HTMLInputElement>;
  @ViewChild('dialTrigger') private dialTriggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('optionsList') private optionsListRef?: ElementRef<HTMLUListElement>;
  @ViewChild('dialWrapEl', { static: true }) private dialWrapRef!: ElementRef<HTMLElement>;
  @ViewChild('panelTemplate') private panelTemplateRef?: TemplateRef<unknown>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private panelOverlayRef?: OverlayRef;

  /**
   * Explicit label→control association. Without it, clicking any non-control
   * descendant of the wrapping <label> (e.g. a dropdown option) makes the
   * browser forward a synthetic click to the FIRST labelable element inside
   * the label — which would be the dial-code trigger button, reopening the
   * panel right after selection closed it.
   */
  readonly fieldId = `sic-input-phone-${++nextFieldId}`;

  override value = '';
  selectedCountryCode = this.detectDefaultCountryCode();
  open = false;
  activeIndex = -1;

  get selectedCountry(): SicPhoneCountry | undefined {
    return this.countries.find((country) => country.code === this.selectedCountryCode);
  }

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.panelOverlayRef?.dispose();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.open) {
      return;
    }

    const target = event.target as Node;
    // The panel now renders in a CDK overlay attached to the document body (see
    // openPanelOverlay()), so it's no longer a DOM descendant of this host — a click
    // anywhere inside it (e.g. between options, not on one) must still count as "inside".
    const insideHost = this.elementRef.nativeElement.contains(target);
    const insidePanel = this.panelOverlayRef?.overlayElement.contains(target) ?? false;

    if (!insideHost && !insidePanel) {
      this.closePanel();
    }
  }

  handleTriggerClick(event: MouseEvent): void {
    // Suppresses the browser's native <label> click-forwarding (this button
    // sits inside the field's <label>, alongside the phone <input>), which
    // would otherwise steal focus back to whichever control the label
    // resolves to right after we set it below.
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    if (this.open) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel(): void {
    this.open = true;
    this.activeIndex = this.countries.findIndex((c) => c.code === this.selectedCountryCode);
    this.dialTriggerRef?.nativeElement.focus();
    this.openPanelOverlay();

    // The options <ul> only exists once the panel overlay attaches, which
    // happens on the change detection that follows this call — defer the
    // scroll until it's actually in the DOM, otherwise the list stays
    // scrolled to the top and the active item (which can sit far down the
    // 240-country list) is invisible even though keyboard nav is moving it.
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.scrollActiveIntoView());
    }
  }

  closePanel(): void {
    this.open = false;
    this.activeIndex = -1;
    this.closePanelOverlay();
  }

  // The country panel used to be a plain `position: absolute` child of `.sic-input-phone__dial`,
  // which any ancestor with `overflow: hidden` (sic-card, sic-gridpanel cells, etc.) silently
  // clips once it extends past that ancestor's edge. A CDK overlay attaches to the document body
  // instead, so it always renders above everything regardless of what wraps this component.
  private openPanelOverlay(): void {
    if (this.panelOverlayRef || !this.panelTemplateRef) {
      return;
    }

    const triggerWidth = this.dialWrapRef.nativeElement.getBoundingClientRect().width;
    this.panelOverlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo(this.dialWrapRef).withPositions(PHONE_PANEL_OVERLAY_POSITIONS).withPush(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: `max(11rem, ${triggerWidth}px)`,
    });

    this.panelOverlayRef.attach(new TemplatePortal(this.panelTemplateRef, this.viewContainerRef));
  }

  private closePanelOverlay(): void {
    this.panelOverlayRef?.dispose();
    this.panelOverlayRef = undefined;
  }

  selectCountry(event: MouseEvent | undefined, country: SicPhoneCountry): void {
    event?.preventDefault();

    this.selectedCountryCode = country.code;
    this.closePanel();
    this.emit();
    this.phoneFieldRef?.nativeElement.focus();
  }

  handleDialKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!this.open) {
        this.openPanel();
        return;
      }

      this.activeIndex = Math.min(this.activeIndex + 1, this.countries.length - 1);
      this.scrollActiveIntoView();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      this.scrollActiveIntoView();
      return;
    }

    if (event.key === 'Enter') {
      if (this.open && this.activeIndex >= 0 && this.activeIndex < this.countries.length) {
        event.preventDefault();
        this.selectCountry(undefined, this.countries[this.activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      this.closePanel();
    }
  }

  handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.emit();
  }

  handleBlur(): void {
    this.markTouched();
  }

  private emit(): void {
    this.onChange(`${this.selectedCountry?.dialCode ?? ''} ${this.value}`.trim());
  }

  private scrollActiveIntoView(): void {
    const list = this.optionsListRef?.nativeElement;
    const active = list?.children[this.activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: 'nearest' });
  }

  private detectDefaultCountryCode(): string {
    if (isPlatformBrowser(this.platformId)) {
      const locales = navigator.languages?.length ? navigator.languages : [navigator.language];

      for (const locale of locales) {
        const region = locale?.split(/[-_]/)[1]?.toUpperCase();

        if (region && this.countries.some((country) => country.code === region)) {
          return region;
        }
      }
    }

    return this.countries.find((country) => country.code === 'US')?.code ?? this.countries[0]?.code ?? '';
  }
}

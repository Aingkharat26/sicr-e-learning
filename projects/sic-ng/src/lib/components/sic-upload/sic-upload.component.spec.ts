import { TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicUploadComponent } from './sic-upload.component';

describe('SicUploadComponent SIC_CONFIG defaults', () => {
  it('defaults maxSizeMb to 10 and the built-in hint with no SIC_CONFIG provided', async () => {
    await TestBed.configureTestingModule({ imports: [SicUploadComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SicUploadComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.maxSizeMb).toBe(10);
    expect(fixture.nativeElement.querySelector('.sic-upload__hint-text').textContent).toBe(
      'Drag & drop files here, or click to browse',
    );
  });

  it('uses SIC_CONFIG.maxUploadSizeMb and messages.dragDropHint when the caller does not override them', async () => {
    await TestBed.configureTestingModule({
      imports: [SicUploadComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { maxUploadSizeMb: 25, messages: { dragDropHint: 'ลากไฟล์มาวางที่นี่' } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicUploadComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.maxSizeMb).toBe(25);
    expect(fixture.nativeElement.querySelector('.sic-upload__hint-text').textContent).toBe('ลากไฟล์มาวางที่นี่');
  });
});

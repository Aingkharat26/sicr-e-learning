import { FormControl, FormGroup } from '@angular/forms';
import { SicFormData, SicStateModel } from './sic-form-data';
import { sicFormCombine } from './sic-form-combine';
import { SicGridPanelComponent } from '../components/sic-gridpanel/sic-gridpanel.component';

interface ContactModel extends SicStateModel {
  name: string;
}

function buildFormData(name = 'Ada'): SicFormData<ContactModel> {
  const form = new FormGroup({ name: new FormControl(name) });
  return new SicFormData<ContactModel>(form, { name });
}

function buildGridStub(valid: boolean, payload: unknown[]): SicGridPanelComponent & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    valid,
    invalid: !valid,
    markAllAsTouched: () => calls.push('markAllAsTouched'),
    restore: () => calls.push('restore'),
    reset: () => calls.push('reset'),
    getChangedRowsPayload: () => payload,
  } as unknown as SicGridPanelComponent & { calls: string[] };
}

describe('sicFormCombine', () => {
  it('combines a valid SicFormData and a valid grid into one keyed, valid result', () => {
    const contact = buildFormData('Ada');
    const items = buildGridStub(true, [{ name: 'Widget' }]);

    const result = sicFormCombine({ contact, items });

    expect(result.valid).toBe(true);
    expect(result.invalid).toBe(false);
    expect(result.value).toEqual({
      contact: contact.value,
      items: [{ name: 'Widget' }],
    });
  });

  it('is invalid overall when the SicFormData source is invalid', () => {
    const form = new FormGroup({ name: new FormControl('', { validators: [(c) => (c.value ? null : { required: true })] }) });
    const contact = new SicFormData<ContactModel>(form, { name: '' });
    const items = buildGridStub(true, []);

    const result = sicFormCombine({ contact, items });

    expect(result.valid).toBe(false);
    expect(result.invalid).toBe(true);
  });

  it('is invalid overall when a grid source is invalid', () => {
    const contact = buildFormData('Ada');
    const items = buildGridStub(false, []);

    const result = sicFormCombine({ contact, items });

    expect(result.valid).toBe(false);
  });

  it('markAllAsTouched() proxies to every source', () => {
    const contact = buildFormData('Ada');
    const items = buildGridStub(true, []);

    sicFormCombine({ contact, items }).markAllAsTouched();

    expect(contact.formGroup.get('name')?.touched).toBe(true);
    expect(items.calls).toEqual(['markAllAsTouched']);
  });

  it('restore() proxies to every source', () => {
    const contact = buildFormData('Ada');
    contact.formGroup.get('name')?.setValue('Bob');
    const items = buildGridStub(true, []);

    sicFormCombine({ contact, items }).restore();

    expect(contact.formGroup.get('name')?.value).toBe('Ada');
    expect(items.calls).toEqual(['restore']);
  });

  it('reset() proxies to every source', () => {
    const contact = buildFormData('Ada');
    const items = buildGridStub(true, []);

    sicFormCombine({ contact, items }).reset();

    expect(contact.formGroup.get('name')?.value).toBeNull();
    expect(items.calls).toEqual(['reset']);
  });

  it('reflects live edits made after sicFormCombine() was called', () => {
    const contact = buildFormData('Ada');
    const items = buildGridStub(true, []);
    const combined = sicFormCombine({ contact, items });

    expect(combined.valid).toBe(true);

    (items as unknown as { valid: boolean }).valid = false;
    expect(combined.valid).toBe(false);
  });
});

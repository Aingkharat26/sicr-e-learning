import { FormControl, FormGroup } from '@angular/forms';
import { SicEntityState } from './sic-entity-state';
import { SicFormData, SicStateModel } from './sic-form-data';

interface TestModel extends SicStateModel {
  name: string;
}

function buildForm(name = ''): FormGroup {
  return new FormGroup({
    name: new FormControl(name),
    state: new FormControl<SicEntityState | null>(null),
  });
}

describe('SicFormData', () => {
  afterEach(() => {
    // Nothing persists between tests, but keep the pattern explicit for future additions.
  });

  it('defaults to Added when no model is passed (a brand-new blank row)', () => {
    const formData = new SicFormData<TestModel>(buildForm());

    expect(formData.state).toBe(SicEntityState.Added);
    expect(formData.isChanged).toBe(true);
  });

  it('adds a `state` control itself when the form was built without one, instead of silently never syncing it', () => {
    const form = new FormGroup({ name: new FormControl('Ada') });
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    expect(form.get('state')).not.toBeNull();
    expect(form.get('state')?.value).toBe(SicEntityState.Unchanged);

    form.get('name')?.setValue('Grace');
    expect(formData.state).toBe(SicEntityState.Modified);
    expect(form.get('state')?.value).toBe(SicEntityState.Modified);
  });

  it('defaults to Unchanged when an existing model is passed, even without a `state` field on it', () => {
    const formData = new SicFormData<TestModel>(buildForm(), { name: 'Ada' });

    expect(formData.state).toBe(SicEntityState.Unchanged);
    expect(formData.isNotChanged).toBe(true);
  });

  it('honors an explicit state on the passed model over the Added/Unchanged default', () => {
    const formData = new SicFormData<TestModel>(buildForm(), { name: 'Ada', state: SicEntityState.Modified });

    expect(formData.state).toBe(SicEntityState.Modified);
  });

  it('transitions to Modified once the form value diverges from the loaded baseline', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    form.get('name')?.setValue('Grace');

    expect(formData.state).toBe(SicEntityState.Modified);
  });

  it('transitions back to Unchanged once the form value matches the baseline again', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    form.get('name')?.setValue('Grace');
    form.get('name')?.setValue('Ada');

    expect(formData.state).toBe(SicEntityState.Unchanged);
  });

  it('stays Added regardless of further edits to a new row', () => {
    const form = buildForm();
    const formData = new SicFormData<TestModel>(form);

    form.get('name')?.setValue('Ada');

    expect(formData.state).toBe(SicEntityState.Added);
  });

  it('marks Deleted via delete(), and further edits do not move it out of Deleted', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    formData.delete();
    form.get('name')?.setValue('Grace');

    expect(formData.state).toBe(SicEntityState.Deleted);
  });

  it('restore() discards unsaved edits, reverting both the form value and state back to the loaded baseline', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    form.get('name')?.setValue('Grace');
    expect(formData.state).toBe(SicEntityState.Modified);

    formData.restore();

    expect(form.get('name')?.value).toBe('Ada');
    expect(formData.state).toBe(SicEntityState.Unchanged);
  });

  it('restore() also reverses a pending delete(), since the reverted value no longer differs from baseline', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    form.get('name')?.setValue('Grace');
    formData.delete();
    expect(formData.state).toBe(SicEntityState.Deleted);

    formData.restore();

    expect(form.get('name')?.value).toBe('Ada');
    expect(formData.state).toBe(SicEntityState.Unchanged);
  });

  it('restore() on a still-Added (never-saved) row reverts the value to blank but stays Added', () => {
    const form = buildForm();
    const formData = new SicFormData<TestModel>(form);

    form.get('name')?.setValue('Ada');
    expect(formData.state).toBe(SicEntityState.Added);

    formData.restore();

    expect(form.get('name')?.value).toBe('');
    expect(formData.state).toBe(SicEntityState.Added);
  });

  it('restore() reverts to the just-saved value (not the construction-time value) after markAsPristine()', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    form.get('name')?.setValue('Grace');
    formData.markAsPristine();

    form.get('name')?.setValue('Henrietta');
    formData.restore();

    expect(form.get('name')?.value).toBe('Grace');
    expect(formData.state).toBe(SicEntityState.Unchanged);
  });

  it('reset() clears every control back to its own default value and lets state re-derive reactively', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    formData.reset();

    expect(form.get('name')?.value).toBeNull();
    expect(formData.state).toBe(SicEntityState.Modified);
    expect(form.pristine).toBe(true);
  });

  it('re-baselines the comparable value on markAsPristine(), so a later edit is judged against the just-saved value, not the construction-time value', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    form.get('name')?.setValue('Grace');
    formData.markAsPristine();

    expect(formData.state).toBe(SicEntityState.Unchanged);
    expect(form.dirty).toBe(false);

    form.get('name')?.setValue('Henrietta');
    expect(formData.state).toBe(SicEntityState.Modified);

    form.get('name')?.setValue('Grace');
    expect(formData.state).toBe(SicEntityState.Unchanged);
  });

  it('reports invalid as false for a Deleted row even if its own validators would otherwise fail', () => {
    const form = new FormGroup({
      name: new FormControl('Ada', { nonNullable: true }),
      state: new FormControl<SicEntityState | null>(null),
    });
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    form.get('name')?.setErrors({ required: true });
    expect(formData.invalid).toBe(true);

    formData.delete();
    expect(formData.invalid).toBe(false);
    expect(formData.valid).toBe(true);
  });

  it('value excludes `state` when the passed model never declared it, even though the form always tracks state internally', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    form.get('name')?.setValue('Grace');

    expect(formData.value).toEqual({ name: 'Grace' });
    expect(form.getRawValue()).toEqual({ name: 'Grace', state: SicEntityState.Modified });
  });

  it('value includes `state` when the passed model declared it (e.g. an editable-grid row building a bulk-save payload)', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada', state: SicEntityState.Unchanged });

    form.get('name')?.setValue('Grace');

    expect(formData.value).toEqual({ name: 'Grace', state: SicEntityState.Modified });
  });

  it('stops syncing state from the form once destroy() is called', () => {
    const form = buildForm('Ada');
    const formData = new SicFormData<TestModel>(form, { name: 'Ada' });

    formData.destroy();
    form.get('name')?.setValue('Grace');

    expect(formData.state).toBe(SicEntityState.Unchanged);
  });
});

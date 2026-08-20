import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SicEntityState } from './sic-entity-state';
import { SicStateModel } from './sic-form-data';
import { createSicFormGroup, ToForm } from './form.type';

interface TestModel {
  name: string;
  nickname?: string;
}

interface StatefulTestModel extends SicStateModel {
  name: string;
}

describe('ToForm', () => {
  it('produces a control per field, with the value (not the control itself) allowed to be null', () => {
    // Also a compile-time assertion: `-?` in ToForm means `nickname` must be
    // supplied here even though it's optional on TestModel — if that modifier
    // were missing, omitting it below would still type-check.
    const group = new FormGroup<ToForm<TestModel>>({
      name: new FormControl('Ada', { nonNullable: true }),
      nickname: new FormControl<string | null>(null),
    });

    expect(group.getRawValue()).toEqual({ name: 'Ada', nickname: null });
  });
});

describe('createSicFormGroup', () => {
  it('appends a `state` control automatically, without the caller declaring one', () => {
    const fb = new FormBuilder();
    const group = createSicFormGroup<StatefulTestModel>(fb, {
      name: fb.control('Ada'),
    });

    expect(group.getRawValue()).toEqual({ name: 'Ada', state: null });
  });
});

import { EnvironmentInjector, createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SIC_CONFIG, injectSicConfig, provideSicConfig } from './sic-config';

describe('provideSicConfig / injectSicConfig', () => {
  it('injectSicConfig() returns an empty object when nothing was provided', () => {
    TestBed.configureTestingModule({});
    const parent = TestBed.inject(EnvironmentInjector);
    const env = createEnvironmentInjector([], parent);

    const config = runInInjectionContext(env, () => injectSicConfig());

    expect(config).toEqual({});
  });

  it('injectSicConfig() returns the config registered via provideSicConfig()', () => {
    TestBed.configureTestingModule({});
    const parent = TestBed.inject(EnvironmentInjector);
    const env = createEnvironmentInjector([provideSicConfig({ decimals: 4, era: 'BE' })], parent);

    const config = runInInjectionContext(env, () => injectSicConfig());

    expect(config).toEqual({ decimals: 4, era: 'BE' });
  });

  it('reads directly through the SIC_CONFIG token too', () => {
    TestBed.configureTestingModule({ providers: [{ provide: SIC_CONFIG, useValue: { locale: 'th' } }] });

    expect(TestBed.inject(SIC_CONFIG)).toEqual({ locale: 'th' });
  });
});

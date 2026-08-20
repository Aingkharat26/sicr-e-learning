import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideSicTheme, provideSicConfig, TutorialPageComponent } from 'sic-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([
      {
        path: '',
        component: TutorialPageComponent,
      },
    ]),
    provideSicTheme({
      mode: 'system',
      theme: 'default',
    }),
    provideSicConfig({}),
  ],
};

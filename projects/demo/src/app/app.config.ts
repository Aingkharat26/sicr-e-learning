import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideSicTheme, provideSicConfig, TutorialPageComponent } from 'sic-ng';
import { AppLayoutComponent } from './layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CoursesPlaceholderComponent } from './features/courses/courses-placeholder.component';
import { MyLearningPlaceholderComponent } from './features/my-learning/my-learning-placeholder.component';
import { KmPlaceholderComponent } from './features/km/km-placeholder.component';
import { AdminPlaceholderComponent } from './features/admin/admin-placeholder.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      [
        {
          path: '',
          component: AppLayoutComponent,
          children: [
            {
              path: '',
              component: DashboardComponent,
              title: 'SICR E-LEARNING | หน้าแรก',
            },
            {
              path: 'courses',
              component: CoursesPlaceholderComponent,
              title: 'หลักสูตรทั้งหมด | SICR E-LEARNING',
            },
            {
              path: 'my-learning',
              component: MyLearningPlaceholderComponent,
              title: 'การเรียนของฉัน | SICR E-LEARNING',
            },
            {
              path: 'km',
              component: KmPlaceholderComponent,
              title: 'คลังความรู้องค์กร (KM) | SICR E-LEARNING',
            },
            {
              path: 'admin',
              component: AdminPlaceholderComponent,
              title: 'ระบบจัดการ | SICR E-LEARNING',
            },
            {
              path: 'tutorial',
              component: TutorialPageComponent,
              title: 'UI Component Showcase | SICR E-LEARNING',
            },
          ],
        },
        {
          path: '**',
          redirectTo: '',
        },
      ],
      withComponentInputBinding()
    ),
    provideSicTheme({
      mode: 'light',
      theme: 'default',
      colorPrimary: '#00a887',
      fontSans: '"Prompt", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    provideSicConfig({}),
  ],
};

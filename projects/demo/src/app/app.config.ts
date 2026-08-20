import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideSicTheme, provideSicConfig, TutorialPageComponent } from 'sic-ng';
import { AppLayoutComponent } from './layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CoursesCatalogComponent } from './features/courses/courses-catalog.component';
import { CourseDetailComponent } from './features/courses/course-detail.component';
import { ClassroomPlayerComponent } from './features/courses/classroom-player.component';
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
              component: CoursesCatalogComponent,
              title: 'หลักสูตรทั้งหมด | SICR E-LEARNING',
            },
            {
              path: 'courses/:id',
              component: CourseDetailComponent,
              title: 'รายละเอียดหลักสูตร | SICR E-LEARNING',
            },
            {
              path: 'courses/:id/learn',
              component: ClassroomPlayerComponent,
              title: 'ห้องเรียน | SICR E-LEARNING',
            },
            {
              path: 'courses/:id/learn/:lessonId',
              component: ClassroomPlayerComponent,
              title: 'ห้องเรียน | SICR E-LEARNING',
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

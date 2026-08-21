import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideSicTheme, provideSicConfig, TutorialPageComponent } from 'sic-ng';
import { AppLayoutComponent } from './layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CoursesCatalogComponent } from './features/courses/courses-catalog.component';
import { CourseDetailComponent } from './features/courses/course-detail.component';
import { ClassroomPlayerComponent } from './features/courses/classroom-player.component';
import { MyLearningComponent } from './features/my-learning/my-learning.component';
import { KmHubComponent } from './features/km/km-hub.component';
import { KmArticleDetailComponent } from './features/km/km-article-detail.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { QuizRunnerComponent } from './features/quiz/quiz-runner.component';

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
              path: 'courses/:id/quiz/:quizId',
              component: QuizRunnerComponent,
              title: 'แบบทดสอบ | SICR E-LEARNING',
            },
            {
              path: 'my-learning',
              component: MyLearningComponent,
              title: 'การเรียนของฉัน | SICR E-LEARNING',
            },
            {
              path: 'km',
              component: KmHubComponent,
              title: 'คลังความรู้องค์กร (KM Spaces) | SICR E-LEARNING',
            },
            {
              path: 'km/:id',
              component: KmArticleDetailComponent,
              title: 'บทความองค์ความรู้ (KM) | SICR E-LEARNING',
            },
            {
              path: 'admin',
              component: AdminDashboardComponent,
              title: 'ศูนย์บริหารจัดการ & สตูดิโอผู้สอน | SICR E-LEARNING',
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

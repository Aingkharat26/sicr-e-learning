import { Injectable, signal } from '@angular/core';

export type UserGuideTab = 'learner' | 'instructor' | 'admin' | 'km' | 'shortcuts';

@Injectable({
  providedIn: 'root',
})
export class UserGuideService {
  readonly isOpen = signal(false);
  readonly activeTab = signal<UserGuideTab>('learner');

  openGuide(tab: UserGuideTab = 'learner'): void {
    this.activeTab.set(tab);
    this.isOpen.set(true);
  }

  closeGuide(): void {
    this.isOpen.set(false);
  }

  setTab(tab: UserGuideTab): void {
    this.activeTab.set(tab);
  }
}

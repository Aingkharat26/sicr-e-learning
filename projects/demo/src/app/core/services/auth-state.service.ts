import { Injectable, computed, signal } from '@angular/core';
import { MOCK_USERS, UserProfile, UserRole } from '../models/user.model';
export type { UserProfile, UserRole };

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly _currentRole = signal<UserRole>('learner');

  readonly currentRole = this._currentRole.asReadonly();
  readonly currentUser = computed<UserProfile>(() => MOCK_USERS[this._currentRole()]);

  readonly isLearner = computed(() => this._currentRole() === 'learner');
  readonly isInstructor = computed(() => this._currentRole() === 'instructor');
  readonly isAdmin = computed(() => this._currentRole() === 'admin');

  switchRole(role: UserRole): void {
    this._currentRole.set(role);
  }
}

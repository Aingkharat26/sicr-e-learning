import { TestBed } from '@angular/core/testing';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { SIC_CONFIG, SicConfig } from '../config/sic-config';
import { SicDialogService } from '../components/sic-dialog/sic-dialog.service';
import { SIC_SKIP_DEACTIVATE_GUARD, SicCanComponentDeactivate, sicCanDeactivateGuard } from './sic-can-deactivate.guard';

function routeSnapshot(data: Record<string, unknown> = {}, child: ActivatedRouteSnapshot | null = null): ActivatedRouteSnapshot {
  return { data, firstChild: child } as unknown as ActivatedRouteSnapshot;
}

function stateSnapshot(root: ActivatedRouteSnapshot): RouterStateSnapshot {
  return { root } as unknown as RouterStateSnapshot;
}

describe('sicCanDeactivateGuard', () => {
  let confirmSpy: ReturnType<typeof vi.fn>;

  function configureTestBed(config?: SicConfig): void {
    confirmSpy = vi.fn().mockReturnValue(of(true));
    TestBed.configureTestingModule({
      providers: [
        { provide: SicDialogService, useValue: { confirm: confirmSpy } },
        ...(config ? [{ provide: SIC_CONFIG, useValue: config }] : []),
      ],
    });
  }

  function runGuard(component: SicCanComponentDeactivate, nextState: RouterStateSnapshot = stateSnapshot(routeSnapshot())) {
    return TestBed.runInInjectionContext(() =>
      sicCanDeactivateGuard(component, routeSnapshot(), stateSnapshot(routeSnapshot()), nextState),
    );
  }

  it('allows navigation without prompting when the component has no unsaved changes', () => {
    configureTestBed();
    const result = runGuard({ pageDirty: () => false });

    expect(result).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('allows navigation without prompting when the component does not implement pageDirty at all', () => {
    configureTestBed();
    const result = runGuard({} as SicCanComponentDeactivate);

    expect(result).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('prompts via SicDialogService.confirm() with the default messages when the page is dirty', async () => {
    configureTestBed();
    const result = runGuard({ pageDirty: () => true });

    expect(isObservable(result)).toBe(true);
    expect(confirmSpy).toHaveBeenCalledWith('Unsaved changes', 'You have unsaved changes. Leave this page anyway?');
    await expect(firstValueFrom(result as Observable<boolean>)).resolves.toBe(true);
  });

  it('uses SicMessages.unsavedChangesTitle/unsavedChangesMessage when configured', () => {
    configureTestBed({ messages: { unsavedChangesTitle: 'มีการเปลี่ยนแปลงข้อมูล', unsavedChangesMessage: 'ต้องการออกจากหน้านี้หรือไม่?' } });
    runGuard({ pageDirty: () => true });

    expect(confirmSpy).toHaveBeenCalledWith('มีการเปลี่ยนแปลงข้อมูล', 'ต้องการออกจากหน้านี้หรือไม่?');
  });

  it('skips the prompt when the target route sets the SIC_SKIP_DEACTIVATE_GUARD data flag, even while dirty', () => {
    configureTestBed();
    const nextState = stateSnapshot(routeSnapshot({}, routeSnapshot({ [SIC_SKIP_DEACTIVATE_GUARD]: true })));

    const result = runGuard({ pageDirty: () => true }, nextState);

    expect(result).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('blocks navigation instead of hanging when SicDialogService.confirm() errors', async () => {
    configureTestBed();
    confirmSpy.mockReturnValue(throwError(() => new Error('dialog broke')));

    const result = runGuard({ pageDirty: () => true });

    await expect(firstValueFrom(result as Observable<boolean>)).resolves.toBe(false);
  });
});

import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, createUrlTreeFromSnapshot } from '@angular/router';

export const authCheckGuard: CanActivateFn = async (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) => {
    const pass = await window.electronAPI.onGetPassword();
    if (pass) {
      return true;
    } else {
      return createUrlTreeFromSnapshot(next, ['/login']);
    }
};

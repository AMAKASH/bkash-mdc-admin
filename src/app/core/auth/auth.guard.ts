import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user.pipe(
    take(1),
    map((user) => {
      const isAuth = !!user;

      if (isAuth) {
        return true;
      } else {
        authService.redirectedRoute = route;
        return router.createUrlTree(['/', 'login']);
      }
    })
  );
};

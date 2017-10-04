import { Injectable }     from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                         from '@angular/router';

import { AuthService }    from './auth.service';

@Injectable()
export class AnonymousGuardService implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return !this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    this.authService.redirectUrl = url;

    if(this.authService.isLoggedIn === true) {
      this.router.navigate(['/']);
    }
    return this.authService.isLoggedIn;
  }

}

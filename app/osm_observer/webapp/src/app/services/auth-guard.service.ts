import { Injectable }     from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                         from '@angular/router';

import { AuthService }    from './auth.service';
import { AuthResponse }   from '../types/auth-response';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    this.authService.redirectUrl = url;
    let loggedIn = this.authService.isLoggedIn();
    if(loggedIn === false) {
      this.router.navigate(['/login']);
    }
    return loggedIn;
  }

}

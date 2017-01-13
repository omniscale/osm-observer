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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): Promise<boolean> {
    return this.authService.isLoggedIn()
                           .then(r => {
                             if(r.success) {
                               return true;
                             } else {
                               this.authService.redirectUrl = url;
                               this.router.navigate(['/login'])
                               return false;
                             }
                           })
                           // TODO define onError actions
                           .catch(e => {});
  }

}

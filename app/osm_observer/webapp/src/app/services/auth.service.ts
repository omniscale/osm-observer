import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/Rx';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { User } from '../types/user';
import { AuthResponse } from '../types/auth-response';

@Injectable()
export class AuthService extends BaseHttpService {
  private loginUrl(): string {
    return this.location.prepareExternalUrl('api/login');
  }
  private logoutUrl(): string {
    return this.location.prepareExternalUrl('api/logout');
  }

  redirectUrl: string;

  constructor(router: Router, private http: Http, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
  }

  login(user: User): Observable<AuthResponse> {
    return this.http.post(this.loginUrl(), user, this.getRequestOptions())
                    .map((response:Response) => response.json() as AuthResponse)
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'login', this.loginUrl(), user)
                    ));
  }

  isLoggedIn(): boolean {
    let loggedIn = this.cookieService.get('loggedIn');
    if(loggedIn === '1') {
      return true;
    }
    return false;
  }

  logout(): Observable<AuthResponse> {
    console.log('logout called')
    return this.http.get(this.logoutUrl(), this.getRequestOptions())
                    .map((response:Response) => response.json() as AuthResponse)
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'logout', this.logoutUrl())
                    ));
  }
}

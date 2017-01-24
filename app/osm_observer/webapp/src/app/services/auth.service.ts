import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { User } from '../types/user';
import { AuthResponse } from '../types/auth-response';

@Injectable()
export class AuthService extends BaseHttpService {
  private loginUrl = '/api/login';
  private logoutUrl = '/api/logout';

  redirectUrl: string;

  constructor(router: Router, private http: Http, cookieService: CookieService) {
    super(router, cookieService);
  }

  login(user: User): Promise<AuthResponse> {
    return this.http.post(this.loginUrl, user, this.getRequestOptions())
                    .toPromise()
                    .then(response => response.json() as AuthResponse)
                    .catch(error => {
                      return this.handleError(error, 'login', this.loginUrl, user);
                    });
  }

  isLoggedIn(): boolean {
    let loggedIn = this.cookieService.get('loggedIn');
    if(loggedIn === '1') {
      return true;
    }
    return false;
  }

  logout(): Promise<AuthResponse> {
    return this.http.get(this.logoutUrl, this.getRequestOptions())
                    .toPromise()
                    .then(response => {
                      return response.json() as AuthResponse;
                    })
                    .catch(error => {
                      return this.handleError(error, 'logout', this.logoutUrl);
                    });
  }
}

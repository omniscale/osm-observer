import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BaseHttpService } from './base-http.service';
import { User } from '../types/user';
import { AuthResponse } from '../types/auth-response';

@Injectable()
export class AuthService extends BaseHttpService {
  private loginUrl = '/api/login';
  private logoutUrl = '/api/logout';
  private isLoggedInUrl = '/api/is-logged-in';

  redirectUrl: string;

  constructor(private http: Http) {
    super();
  }

  login(user: User): Promise<AuthResponse> {
    return this.http.post(this.loginUrl, user, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as AuthResponse)
                    .catch(error => {
                      return this.handleError(error, 'login', this.loginUrl, user);
                    });
  }

  isLoggedIn(): Promise<AuthResponse> {

    return this.http.get(this.isLoggedInUrl, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as AuthResponse)
                    .catch(error => {
                      return this.handleError(error, 'isLoggedIn', this.isLoggedInUrl);
                    });
  }

  logout(): Promise<AuthResponse> {
    return this.http.get(this.logoutUrl, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as AuthResponse)
                    .catch(error => {
                      return this.handleError(error, 'logout', this.logoutUrl);
                    });
  }
}

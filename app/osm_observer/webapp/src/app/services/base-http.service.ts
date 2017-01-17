import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/services/cookies.service';

@Injectable()
export class BaseHttpService {
  constructor(public router: Router, public cookieService: CookieService) {}

  getRequestOptions(params?: URLSearchParams): RequestOptions {
    let requestOptions = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      })
    });
    if(params !== undefined) {
      requestOptions.search = params;
    }

    return requestOptions;
  }

  handleError(error: Response, caller: string, url: string, opt?: any): Promise<any> {
    if(error.status === 401 || error.status === 403) {
      this.cookieService.remove('loggedIn');
      this.router.navigate(['/login']);
      return;
    }
    let jsonError = error.json();
    let msg = `An error occurred in ${caller} when calling '${url}': '${jsonError.error}' (${error.status})`;
    if(opt === undefined) {
      console.warn(msg);
    } else {
      console.warn(msg, opt);
    }
    return Promise.reject(error);
  }
}

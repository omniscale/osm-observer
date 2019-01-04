import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/services/cookies.service';


@Injectable()
export class BaseHttpService {
  constructor(public router: Router, public cookieService: CookieService) {}

  httpOptions = {
    headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    })
  };

  handleError(error: Response, caller: string, url: string, opt?: any): any {
    if(error.status === 401 || error.status === 403) {
      this.cookieService.remove('loggedIn');
      this.cookieService.remove('isAdmin');
      this.cookieService.remove('username');
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
    return error;
  }
}

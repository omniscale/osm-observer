import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';

@Injectable()
export class BaseHttpService {
  defaultRequestOptions = new RequestOptions({
    headers: new Headers({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    })
  });

  constructor(private router: Router) {}

  handleError(error: Response, caller: string, url: string, opt?: any): Promise<any> {
    if(error.status === 401 || error.status === 403) {
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

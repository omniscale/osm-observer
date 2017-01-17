import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/toPromise';
import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { Coverage } from '../types/coverage';

@Injectable()
export class CoverageService extends BaseHttpService {

  private coveragesUrl = '/api/coverages';

  constructor(router: Router, private http: Http, cookieService: CookieService) {
    super(router, cookieService);
  }

  getCoverages(): Promise<Coverage[]> {
    return this.http.get(this.coveragesUrl, this.getRequestOptions())
               .toPromise()
               .then(response => response.json() as Coverage[])
               .catch(error => {
                 return this.handleError(error, 'getCoverages', this.coveragesUrl);
               });
  }
}

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/toPromise';

import { BaseHttpService } from './base-http.service';
import { Coverage } from '../types/coverage';

@Injectable()
export class CoverageService extends BaseHttpService {

  private coveragesUrl = '/api/coverages';

  constructor(router: Router, private http: Http) {
    super(router);
  }

  getCoverages(): Promise<Coverage[]> {
    return this.http.get(this.coveragesUrl, this.defaultRequestOptions)
               .toPromise()
               .then(response => response.json() as Coverage[])
               .catch(error => {
                 return this.handleError(error, 'getCoverages', this.coveragesUrl);
               });
  }
}

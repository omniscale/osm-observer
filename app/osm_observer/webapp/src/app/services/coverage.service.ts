import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { BaseHttpService } from './base-http.service';
import { Coverage } from '../types/coverage';

@Injectable()
export class CoverageService extends BaseHttpService {

  private coveragesUrl = '/api/coverages';

  constructor(private http: Http) {
    super();
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

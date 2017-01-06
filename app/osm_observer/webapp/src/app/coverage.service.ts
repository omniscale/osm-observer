import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Coverage } from './coverage';

@Injectable()
export class CoverageService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private coveragesUrl = '/api/coverages';

  constructor(private http: Http) { }

  getCoverages(): Promise<Coverage[]> {
    return this.http.get(this.coveragesUrl)
               .toPromise()
               .then(response => response.json() as Coverage[])
               .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}

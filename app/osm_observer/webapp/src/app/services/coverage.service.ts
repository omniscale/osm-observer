import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/Rx';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { Coverage } from '../types/coverage';

@Injectable()
export class CoverageService extends BaseHttpService {

  private coveragesUrl(): string {
    return this.location.prepareExternalUrl('api/coverages/all');
  }
  private activeCoveragesUrl(): string {
    return this.location.prepareExternalUrl('api/coverages/actives');
  }
  private setActiveCoveragesUrl(): string {
    return this.location.prepareExternalUrl('api/coverages/set-actives');
  }

  constructor(router: Router, private http: Http, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
  }

  getCoverages(): Observable<Coverage[]> {
    return this.http.get(this.coveragesUrl(), this.getRequestOptions())
               .map((response:Response) => response.json() as Coverage[])
               .catch((error:any) => Observable.throw(
                 this.handleError(error, 'getCoverages', this.coveragesUrl())
               ));
  }

  getActiveCoverages(): Observable<Coverage[]> {
    return this.http.get(this.activeCoveragesUrl(), this.getRequestOptions())
               .map((response:Response) => response.json() as Coverage[])
               .catch((error:any) => Observable.throw(
                 this.handleError(error, 'getActiveCoverages', this.activeCoveragesUrl())
               ));
  }

  setActiveCoverages(coverageIds: number[]): Observable<any> {
    let data = {'coverageIds': coverageIds}
    return this.http.post(this.setActiveCoveragesUrl(), data, this.getRequestOptions())
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'setActiveCoverages', this.setActiveCoveragesUrl(), data)
                    ));
  }
}

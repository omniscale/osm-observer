
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { map, catchError } from 'rxjs/operators';

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

  constructor(router: Router, private http: HttpClient, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
  }

  getCoverages(): Observable<Coverage[]> {
    return this.http.get(this.coveragesUrl(), this.getRequestOptions())
               .pipe(map((response: any) => response.json() as Coverage[]),
               catchError((error:any) => observableThrowError(
                 this.handleError(error, 'getCoverages', this.coveragesUrl())
               )));
  }

  getActiveCoverages(): Observable<Coverage[]> {
    return this.http.get(this.activeCoveragesUrl(), this.getRequestOptions())
               .pipe(map((response: any) => response.json() as Coverage[]),
               catchError((error:any) => observableThrowError(
                 this.handleError(error, 'getActiveCoverages', this.activeCoveragesUrl())
               )));
  }

  setActiveCoverages(coverageIds: number[]): Observable<any> {
    let data = {'coverageIds': coverageIds}
    return this.http.post(this.setActiveCoveragesUrl(), data, this.getRequestOptions())
                    .pipe(catchError((error:any) => observableThrowError(
                      this.handleError(error, 'setActiveCoverages', this.setActiveCoveragesUrl(), data)
                    )));
  }
}

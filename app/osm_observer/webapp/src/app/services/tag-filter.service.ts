
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { map, catchError } from 'rxjs/operators';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { TagFilter } from '../types/tag-filter';

@Injectable()
export class TagFilterService extends BaseHttpService {

  private tagFilterUrl(): string {
    return this.location.prepareExternalUrl('api/filter/all');
  }

  private removeFilterUrl(): string {
    return this.location.prepareExternalUrl('api/filter/remove');
  }

  private saveFilterUrl(): string {
    return this.location.prepareExternalUrl('api/filter/save');
  }

  constructor(router: Router, private http: Http, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
  }

  getTagFilters(): Observable<TagFilter[]> {
    return this.http.get(this.tagFilterUrl(), this.getRequestOptions())
               .pipe(map((response:Response) => response.json() as TagFilter[]))
               .pipe(catchError((error:any) => observableThrowError(
                 this.handleError(error, 'getTagFilter', this.tagFilterUrl())
               )));
  }

  removeTagFilter(id: number): Observable<any> {
    let data = {'id': id}
    return this.http.post(this.removeFilterUrl(), data, this.getRequestOptions())
                    .pipe(catchError((error:any) => observableThrowError(
                      this.handleError(error, 'loadTagFilter', this.removeFilterUrl(), data)
                    )));
  }

  saveTagFilter(tagFilter: TagFilter): Observable<any> {
    let data = JSON.stringify(tagFilter); 
    return this.http.post(this.saveFilterUrl(), data, this.getRequestOptions())
                    .pipe(catchError((error:any) => observableThrowError(
                      this.handleError(error, 'saveTagFilter', this.saveFilterUrl(), data)
                    )));
  }
}

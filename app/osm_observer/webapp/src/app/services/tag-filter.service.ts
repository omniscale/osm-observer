import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/Rx';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { TagFilter } from '../types/tag-filter';

@Injectable()
export class TagFilterService extends BaseHttpService {

  private tagFilterUrl(): string {
    return this.location.prepareExternalUrl('api/filter/all');
  }

  private loadFilterUrl(): string {
    return this.location.prepareExternalUrl('api/filter/load');
  }

  private saveFilterUrl(): string {
    return this.location.prepareExternalUrl('api/filter/save');
  }

  constructor(router: Router, private http: Http, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
  }

  getTagFilters(): Observable<TagFilter[]> {
    return this.http.get(this.tagFilterUrl(), this.getRequestOptions())
               .map((response:Response) => response.json() as TagFilter[])
               .catch((error:any) => Observable.throw(
                 this.handleError(error, 'getTagFilter', this.tagFilterUrl())
               ));
  }

  // loadTagFilter(id: number): Observable<any> {
  //   let data = {'id': id}
  //   return this.http.post(this.saveFilterUrl(), data, this.getRequestOptions())
  //                   .catch((error:any) => Observable.throw(
  //                     this.handleError(error, 'loadTagFilter', this.loadFilterUrl(), data)
  //                   ));
  // }

  // saveTagFilter(tagFilter: TagFilter): Observable<any> {
  //   let data = {'code': tagFilter.code};
  //   // TODO JSON.stringify 
  //   return this.http.post(this.saveFilterUrl(), data, this.getRequestOptions())
  //                   .catch((error:any) => Observable.throw(
  //                     this.handleError(error, 'saveTagFilter', this.saveFilterUrl(), data)
  //                   ));
  // }
}

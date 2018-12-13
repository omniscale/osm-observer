
import {throwError as observableThrowError,  Observable, Observer ,  Subject } from 'rxjs';
import { Injectable } from '@angular/core';

import { URLSearchParams } from '@angular/http';
import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { map, catchError } from 'rxjs/operators';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { Changeset } from '../types/changeset';
import { ChangesetComment } from '../types/changeset-comment';
import { ChangesetChange } from '../types/changeset-change';

@Injectable()
export class ChangesetService extends BaseHttpService {

  private changesetsUrl(): string {
    return this.location.prepareExternalUrl('/api/changesets');
  }

  private changesetCommentsUrl(id: number): string {
    return this.location.prepareExternalUrl(`/api/changesets/comments/${id}`);
  }

  private changesetChangesUrl(id: number): string {
    return this.location.prepareExternalUrl(`/api/changesets/changes/${id}`);
  }

  private changesetById(id: number): Changeset {
    for(let changeset of this.changesets) {
        if(changeset.osmId === id) {
          return changeset;
        }
    }
    return undefined;
  }

  private changesets: Changeset[];

  constructor(router: Router, private http: HttpClient, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
    location.prepareExternalUrl('api/changesets/comments/')
  }

  getChangesets(timeRange?: number, coverageId?: number, tagFilterId?): Observable<Changeset[]> {
    let params = new URLSearchParams();
    if(timeRange !== undefined && timeRange !== null) {
      params.set('timeRange', timeRange.toString());
    }
    if(coverageId !== undefined && coverageId !== null) {
      params.set('coverageId', coverageId.toString());
    }
    if(tagFilterId !== undefined && tagFilterId !== null) {
      params.set('tagFilterId', tagFilterId.toString());
    }
    let requestOptions = this.getRequestOptions(params);
    return this.http.get(this.changesetsUrl(), requestOptions)
                    .pipe(map((response: any) => {
                       this.changesets = response.json() as Changeset[];
                       return this.changesets;
                     }),
                     catchError((error:any) => observableThrowError(
                       this.handleError(error, 'getChangesets', this.changesetsUrl(), params.paramsMap)
                     )));
  }

  getChangeset(id: number, forceReload?: boolean): Observable<Changeset> {
    // load changesets when not loaded already
    // e.g. when reloading changeset detail page
    if(this.changesets === undefined || forceReload === true) {
      return this.getChangesets()
          .pipe(map(
            v => {
              return this.changesetById(id);
            }
          ));
    } else {
      return Observable.create((observer: Observer<Changeset>) => {
        observer.next(this.changesetById(id));
        observer.complete();
      });
    }
  }

  getChangesetComments(id: number): Observable<ChangesetComment[]> {
    let url = this.changesetCommentsUrl(id);
    return this.http.get(url, this.getRequestOptions())
                    .pipe(map((response: any) => response.json() as ChangesetComment[]),
                    catchError((error:any) => observableThrowError(
                      this.handleError(error, 'getChangesetComments', url, {id: id})
                    )));
  }

  getChangesetIdx(current: Changeset): number {
    if(this.changesets === undefined) {
      return;
    }
    let idx = this.changesets.indexOf(current);
    if(idx === -1) {
      return;
    }
    return idx;
  }

  getNextChangeset(current: Changeset): Changeset {
    let idx = this.getChangesetIdx(current);
    if(idx === undefined) {
      return;
    }
    idx += 1;
    if(idx === this.changesets.length) {
      return;
    }
    return this.changesets[idx];
  }

  getPrevChangeset(current: Changeset): Changeset {
    let idx = this.getChangesetIdx(current);
    if(idx === undefined) {
      return;
    }
    idx -= 1;
    if(idx < 0) {
      return;
    }
    return this.changesets[idx];
  }

  createCompareFunc(by: string, order: string) {
    if(order === 'asc') {
      return function(a, b) {
        if(a[by] < b[by]) {
          return -1;
        }
        if(a[by] > b[by]) {
          return 1;
        }
        return 0
      }
    } else {
      return function(a, b) {
        if(a[by] > b[by]) {
          return -1;
        }
        if(a[by] < b[by]) {
          return 1;
        }
        return 0
      }
    }
  }

  sortChangesets(by: string, order: string): void {
    this.changesets.sort(this.createCompareFunc(by, order));
  }
}

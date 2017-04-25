import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable, Observer } from 'rxjs/Rx';
import { Subject }    from 'rxjs/Subject';

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

  constructor(router: Router, private http: Http, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
    location.prepareExternalUrl('api/changesets/comments/')
  }

  getChangesets(username?: string, timeRange?: string, sumScore?: number, numReviews?: number, coverageId?: number, statusId?: number, currentUserReviewed?: boolean): Observable<Changeset[]> {
    let params = new URLSearchParams();
    if(username !== undefined && username !== null && username !== '') {
      params.set('username', username);
    }
    if(timeRange !== undefined && timeRange !== null && timeRange !== '') {
      params.set('timeRange', timeRange);
    }
    if(sumScore !== undefined && sumScore !== null) {
      params.set('sumScore', sumScore.toString());
    }
    if(numReviews !== undefined && numReviews !== null) {
      params.set('numReviews', numReviews.toString());
    }
    if(coverageId !== undefined && coverageId !== null) {
      params.set('coverageId', coverageId.toString());
    }
    if(statusId !== undefined && statusId !== null) {
      params.set('statusId', statusId.toString());
    }
    if((typeof(currentUserReviewed) === "boolean")) {
      params.set('currentUserReviewed', currentUserReviewed.toString());
    }
    let requestOptions = this.getRequestOptions(params);
    return this.http.get(this.changesetsUrl(), requestOptions)
                    .map((response:Response) => {
                       this.changesets = response.json() as Changeset[];
                       return this.changesets;
                     })
                     .catch((error:any) => Observable.throw(
                       this.handleError(error, 'getChangesets', this.changesetsUrl(), params.paramsMap)
                     ));
  }

  getChangeset(id: number, forceReload?: boolean): Observable<Changeset> {
    // load changesets when not loaded already
    // e.g. when reloading changeset detail page
    if(this.changesets === undefined || forceReload === true) {
      return this.getChangesets()
          .map(
            v => {
              return this.changesetById(id);
            }
          );
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
                    .map((response:Response) => response.json() as ChangesetComment[])
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'getChangesetComments', url, {id: id})
                    ));
  }

  getChangesetChanges(id: number): Observable<ChangesetChange[]> {
    let url = this.changesetChangesUrl(id);
    return this.http.get(url, this.getRequestOptions())
                    .map((response:Response) => response.json() as ChangesetChange[])
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'getChangesetChanges', url, {id: id})
                    ));
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

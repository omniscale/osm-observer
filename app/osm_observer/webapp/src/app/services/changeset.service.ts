import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/toPromise';
import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { Changeset } from '../types/changeset';
import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetComment } from '../types/changeset-comment';
import { ChangesetChange } from '../types/changeset-change';

@Injectable()
export class ChangesetService extends BaseHttpService {

  private changesetsUrl = '/api/changesets';

  private changesetDetailsUrl(id: number): string {
    return `/api/changesets/details/${id}`;
  }

  private changesetCommentsUrl(id: number): string {
    return `/api/changesets/comments/${id}`;
  }

  private changesetChangesUrl(id: number): string {
    return `/api/changesets/changes/${id}`;
  }

  private changesets: Changeset[];

  constructor(router: Router, private http: Http, cookieService: CookieService) {
    super(router, cookieService);
  }

  getChangesets(username?: string, timeRange?: string, sumScore?: number, numReviews?: number, coverageId?: number): Promise<Changeset[]> {
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

    let requestOptions = this.getRequestOptions(params);

    return this.http.get(this.changesetsUrl, requestOptions)
               .toPromise()
               .then(response => {
                 this.changesets = response.json() as Changeset[];
                 return this.changesets;
               })
               .catch(error => {
                 return this.handleError(error, 'getChangesets', this.changesetsUrl, params.paramsMap);
               });
  }

  getChangeset(id: number): Promise<Changeset> {
    // load changesets when not loaded already
    // e.g. when reloading changeset detail page
    if(this.changesets === undefined) {
      return this.getChangesets().then(v => {
        return this.getChangeset(id);
      })
    } else {
      for(let changeset of this.changesets) {
        if(changeset.osmId === id) {
          return new Promise((resolve, reject) => {
            resolve(changeset);
          });
        }
      }
      return new Promise((resolve, reject) => {
        reject();
      })
    }
  }

  getChangesetDetails(id: number): Promise<ChangesetDetails> {
    let url = this.changesetDetailsUrl(id);
    return this.http.get(url, this.getRequestOptions())
               .toPromise()
               .then(response => response.json() as ChangesetDetails)
               .catch(error => {
                 return this.handleError(error, 'getChangesetDetails', url, {id: id});
               });
  }

  getChangesetComments(id: number): Promise<ChangesetComment[]> {
    let url = this.changesetCommentsUrl(id);
    return this.http.get(url, this.getRequestOptions())
                    .toPromise()
                    .then(response => response.json() as ChangesetComment[])
                    .catch(error => {
                      return this.handleError(error, 'getChangesetComments', url, {id: id});
                    });
  }

  getChangesetChanges(id: number): Promise<ChangesetChange[]> {
    let url = this.changesetChangesUrl(id);
    return this.http.get(url, this.getRequestOptions())
                    .toPromise()
                    .then(response => response.json() as ChangesetChange[])
                    .catch(error => {
                      return this.handleError(error, 'getChangesetChanges', url, {id: id});
                    });
  }

  getChangesetIdx(current: Changeset): number {
    if(this.changesets === undefined) {
      console.warn('changeset list not loaded');
      return;
    }
    let idx = this.changesets.indexOf(current);
    if(idx === -1) {
      console.warn('current changeset not found');
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
      console.warn('current changeset is last of list');
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
      console.warn('current changeset is first of list');
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

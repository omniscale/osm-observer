
import {throwError as observableThrowError,  Observable, Observer ,  Subject } from 'rxjs';
import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

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
    let params = new HttpParams();
    if(timeRange !== undefined && timeRange !== null) {
      params = params.append('timeRange', timeRange.toString());
    }
    if(tagFilterId !== undefined && tagFilterId !== null) {
      params = params.append('tagFilterId', tagFilterId.toString());
    }
    if(coverageId !== undefined && coverageId !== null) {
      params = params.append('coverageId', coverageId.toString());
    }
    return this.http.get<Changeset[]>(this.changesetsUrl(), {params: params})
      .pipe(
        (catchError((error:any) => observableThrowError(
          this.handleError(error, 'getChangesets', this.changesetsUrl(), params)
     ))));
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
}

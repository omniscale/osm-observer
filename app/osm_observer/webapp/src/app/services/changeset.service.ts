import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/toPromise';

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

  constructor(router: Router, private http: Http) {
    super(router);
  }

  getChangesets(username: string, timeRange: string, averageScore: number, numReviews: number, coverageId: number): Promise<Changeset[]> {
    let params = new URLSearchParams();
    if(username !== undefined && username !== null && username !== '') {
      params.set('username', username);
    }
    if(timeRange !== undefined && timeRange !== null && timeRange !== '') {
      params.set('timeRange', timeRange);
    }
    if(averageScore !== undefined && averageScore !== null) {
      params.set('averageScore', averageScore.toString());
    }
    if(numReviews !== undefined && numReviews !== null) {
      params.set('numReviews', numReviews.toString());
    }
    if(coverageId !== undefined && coverageId !== null) {
      params.set('coverageId', coverageId.toString());
    }

    let requestOptions = this.defaultRequestOptions;
    requestOptions.search = params;

    return this.http.get(this.changesetsUrl, requestOptions)
               .toPromise()
               .then(response => response.json() as Changeset[])
               .catch(error => {
                 return this.handleError(error, 'getChangesets', this.changesetsUrl, params.paramsMap);
               });
  }

  getChangesetDetails(id: number): Promise<ChangesetDetails> {
    let url = this.changesetDetailsUrl(id);
    return this.http.get(url, this.defaultRequestOptions)
               .toPromise()
               .then(response => response.json() as ChangesetDetails)
               .catch(error => {
                 return this.handleError(error, 'getChangesetDetails', url, {id: id});
               });
  }

  getChangesetComments(id: number): Promise<ChangesetComment[]> {
    let url = this.changesetCommentsUrl(id);
    return this.http.get(url, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as ChangesetComment[])
                    .catch(error => {
                      return this.handleError(error, 'getChangesetComments', url, {id: id});
                    });
  }

  getChangesetChanges(id: number): Promise<ChangesetChange[]> {
    let url = this.changesetChangesUrl(id);
    return this.http.get(url, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as ChangesetChange[])
                    .catch(error => {
                      return this.handleError(error, 'getChangesetChanges', url, {id: id});
                    });
  }
}

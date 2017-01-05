import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Changeset } from './changeset';

@Injectable()
export class ChangesetService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private changesetsUrl = '/changesets';

  constructor(private http: Http) { }

  getChangesets(): Promise<Changeset[]> {
    return this.http.get(this.changesetsUrl)
               .toPromise()
               .then(response => response.json() as Changeset[])
               .catch(this.handleError);
  }

   private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}

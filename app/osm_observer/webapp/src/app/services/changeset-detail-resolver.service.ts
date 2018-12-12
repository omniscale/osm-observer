import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ChangesetDetailsService } from './changeset-details.service';
import { ChangesetDetails } from '../types/changeset-details';

@Injectable()
export class ChangesetDetailResolver implements Resolve<ChangesetDetails> {

  constructor(private changesetDetailsService: ChangesetDetailsService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ChangesetDetails> {
    let id = parseInt(route.params['id']);
    return this.changesetDetailsService.getChangesetDetails(id)
                                .pipe(map(changeset => {
                                  if(changeset) {
                                    return changeset;
                                  }
                                  this.router.navigate(['/changesets']);
                                }, osmId => id));
  }
}

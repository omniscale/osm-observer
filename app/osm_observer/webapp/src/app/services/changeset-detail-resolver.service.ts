import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { ChangesetService } from './changeset.service';
import { Changeset } from '../types/changeset';

@Injectable()
export class ChangesetDetailResolver implements Resolve<Changeset> {

  constructor(private changesetService: ChangesetService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Changeset> {
    let id = parseInt(route.params['id']);
    return this.changesetService.getChangeset(id)
                                .map(changeset => {
                                  if(changeset) {
                                    return changeset;
                                  }
                                  this.router.navigate(['/changesets']);
                                  return false;
                                });
  }
}

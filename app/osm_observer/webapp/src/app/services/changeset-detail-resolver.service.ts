import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { ChangesetService } from './changeset.service';
import { Changeset } from '../types/changeset';

@Injectable()
export class ChangesetDetailResolver implements Resolve<Changeset> {

  constructor(private changesetService: ChangesetService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Changeset> {
    let id = route.params['id'];

    return this.changesetService.getChangeset(id).then(changeset => {
      if(changeset) {
        return changeset;
      } else {
        this.router.navigate(['/changesets']);
        return null;
      }
    })
  }

}

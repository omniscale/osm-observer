import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetComment } from '../types/changeset-comment';
import { ChangesetChange } from '../types/changeset-change';
import { ChangesetService } from '../services/changeset.service';

@Component({
  selector: 'changeset-details',
  templateUrl: './changeset-details.component.html',
  styleUrls: ['./changeset-details.component.sass']
})
export class ChangesetDetailsComponent implements OnInit {
  @Input()
  id: number;

  changesetDetails: ChangesetDetails;
  changesetComments: ChangesetComment[];

  changesetNodeChanges: ChangesetChange[];
  changesetWayChanges: ChangesetChange[];
  changesetRelationChanges: ChangesetChange[];

  constructor(private changesetService: ChangesetService,
              private router: Router,
              private route: ActivatedRoute) { }

  assignChangesetDetails(changesetDetails: ChangesetDetails) {
    this.changesetDetails = changesetDetails;
  }

  assignChangesetComments(changesetComments: ChangesetComment[]) {
    this.changesetComments = changesetComments;
  }

  assignChangesetChanges(changesetChanges: ChangesetChange[]) {
    this.changesetNodeChanges = [];
    this.changesetWayChanges = [];
    this.changesetRelationChanges = [];
    for (let change of changesetChanges) {
      switch(change.type) {
        case 'node':
          this.changesetNodeChanges.push(change);
          break;
        case 'way':
          this.changesetWayChanges.push(change);
          break;
        case 'relation':
          this.changesetRelationChanges.push(change);
          break;
      }
    }
  }

  getChangesetDetails(id: number): void {
    this.changesetService.getChangesetDetails(id)
                         .then(changesetDetails => this.assignChangesetDetails(changesetDetails))
                         // TODO define onError actions
                         .catch(error => {});
  }

  getChangesetComments(id: number): void {
    this.changesetService.getChangesetComments(id)
                         .then(changesetComments => this.assignChangesetComments(changesetComments))
                         // TODO define onError actions
                         .catch(error => {});
  }

  getChangesetChanges(id: number): void {
    this.changesetService.getChangesetChanges(id)
                         .then(changesetChanges => this.assignChangesetChanges(changesetChanges))
                         // TODO define onError actions
                         .catch(error => {});
  }

  ngOnInit() {
    let id = this.route.snapshot.params['id'];
    if(id !== undefined) {
      this.getChangesetDetails(id);
      this.getChangesetComments(id);
      this.getChangesetChanges(id);
    } else {
      this.router.navigate(['/changesets']);
    }

  }
}

import { Component, OnInit, Input } from '@angular/core';

import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetComment } from '../types/changeset-comment';
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

  constructor(private changesetService: ChangesetService) { }

  assignChangesetDetails(changesetDetails: ChangesetDetails) {
    this.changesetDetails = changesetDetails;
  }

  assignChangesetComments(changesetComments: ChangesetComment[]) {
    this.changesetComments = changesetComments;
  }

  getChangesetDetails(): void {
    this.changesetService.getChangesetDetails(this.id)
                         .then(changesetDetails => this.assignChangesetDetails(changesetDetails))
                         // TODO define onError actions
                         .catch(error => {});
  }

  getChangesetComments(): void {
    this.changesetService.getChangesetComments(this.id)
                         .then(changesetComments => this.assignChangesetComments(changesetComments))
                         // TODO define onError actions
                         .catch(error => {});
  }

  ngOnInit() {
    this.getChangesetDetails();
    this.getChangesetComments();
  }
}

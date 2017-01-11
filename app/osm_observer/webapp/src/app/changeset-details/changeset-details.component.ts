import { Component, OnInit, Input } from '@angular/core';

import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetService } from '../services/changeset.service'

@Component({
  selector: 'changeset-details',
  templateUrl: './changeset-details.component.html',
  styleUrls: ['./changeset-details.component.sass']
})
export class ChangesetDetailsComponent implements OnInit {
  @Input()
  id: number;

  changesetDetails: ChangesetDetails;

  constructor(private changesetService: ChangesetService) { }

  assignChangesetDetails(changesetDetails: ChangesetDetails) {
    this.changesetDetails = changesetDetails;
  }

  getChangesetDetails(): void {
    this.changesetService.getChangesetDetails(this.id)
                         .then(changesetDetails => this.assignChangesetDetails(changesetDetails))
                         // TODO define onError actions
                         .catch(error => {});
  }

  ngOnInit() {
    this.getChangesetDetails()
  }
}

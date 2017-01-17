import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ChangesetDetails } from '../types/changeset-details';
import { Changeset } from '../types/changeset';
import { ChangesetService } from '../services/changeset.service';

@Component({
  selector: 'changeset-details',
  templateUrl: './changeset-details.component.html',
  styleUrls: ['./changeset-details.component.sass']
})
export class ChangesetDetailsComponent implements OnInit {
  @Input() id: number;

  changesetDetails: ChangesetDetails;
  changeset: Changeset;


  constructor(private changesetService: ChangesetService,
              private router: Router,
              private route: ActivatedRoute) { }

  assignChangesetDetails(changesetDetails: ChangesetDetails) {
    this.changesetDetails = changesetDetails;
  }

  getChangesetDetails(id: number): void {
    this.changesetService.getChangesetDetails(id)
                         .then(changesetDetails => this.assignChangesetDetails(changesetDetails))
                         // TODO define onError actions
                         .catch(error => {});
  }


  }

  ngOnInit() {
    this.route.data
        .subscribe((data: {changeset: Changeset}) => {
          this.changeset = data.changeset;
          this.getChangesetDetails(this.changeset.osmId);
        });
  }
}

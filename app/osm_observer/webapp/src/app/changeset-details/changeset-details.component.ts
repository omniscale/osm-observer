import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ChangesetDetails } from '../types/changeset-details';
import { Changeset } from '../types/changeset';
import { ReviewStatus } from '../types/review';
import { ChangesetService } from '../services/changeset.service';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'changeset-details',
  templateUrl: './changeset-details.component.html',
  styleUrls: ['./changeset-details.component.sass']
})
export class ChangesetDetailsComponent implements OnInit {
  @Input() id: number;

  changesetDetails: ChangesetDetails;
  prevChangeset: Changeset;
  currentChangeset: Changeset;
  nextChangeset: Changeset;

  reviewStatus = ReviewStatus;


  constructor(private changesetService: ChangesetService,
              private reviewService: ReviewService,
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

  next() {
    if(this.nextChangeset !== undefined) {
      this.prevChangeset = this.currentChangeset;
      this.currentChangeset = this.nextChangeset;
      this.nextChangeset = this.changesetService.getNextChangeset(this.currentChangeset);
      this.getChangesetDetails(this.currentChangeset.osmId);
    }
  }

  prev() {
    if(this.prevChangeset !== undefined) {
      this.nextChangeset = this.currentChangeset;
      this.currentChangeset = this.prevChangeset;
      this.prevChangeset = this.changesetService.getPrevChangeset(this.currentChangeset);
      this.getChangesetDetails(this.currentChangeset.osmId);
    }
  }

  ngOnInit() {
    this.reviewService.refreshReviews$
        .subscribe(e => {
          this.getChangesetDetails(this.currentChangeset.osmId);
        });
    this.route.data
        .subscribe((data: {changeset: Changeset}) => {
          this.currentChangeset = data.changeset;
          this.prevChangeset = this.changesetService.getPrevChangeset(this.currentChangeset);
          this.nextChangeset = this.changesetService.getNextChangeset(this.currentChangeset);
          this.getChangesetDetails(this.currentChangeset.osmId);
        });
  }
}

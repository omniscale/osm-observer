import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {TranslateService} from 'ng2-translate';

import { Changeset } from '../types/changeset';
import { ChangesetDetails } from '../types/changeset-details';
import { ReviewStatus } from '../types/review';
import { ChangesetDetailsService } from '../services/changeset-details.service';
import { ChangesetService } from '../services/changeset.service';

import { ReviewService } from '../services/review.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'changeset-details',
  templateUrl: './changeset-details.component.html',
  styleUrls: ['./changeset-details.component.sass']
})
export class ChangesetDetailsComponent implements OnInit {
  @Input() id: number;

  prevChangeset: Changeset;
  currentChangeset: Changeset;
  nextChangeset: Changeset;
  currentChangesetDetails: ChangesetDetails;

  reviewStatus = ReviewStatus;

  private endOfListReachedText: string;

  constructor(
              private changesetService: ChangesetService,
              private changesetDetailsService: ChangesetDetailsService,
              private reviewService: ReviewService,
              private router: Router,
              private route: ActivatedRoute,
              private messageService: MessageService,
              private translate: TranslateService) { }

  next() {
    if(this.nextChangeset !== undefined) {
      this.router.navigate(['changesets', this.nextChangeset.osmId, 'details'])
    }
  }

  prev() {
    if(this.prevChangeset !== undefined) {
      this.router.navigate(['changesets', this.prevChangeset.osmId, 'details'])
    }
  }

  ngOnInit() {
    this.translate.get('END OF LIST REACHED').subscribe((res: string) => {
      this.endOfListReachedText = res;
    });
    this.reviewService.refreshReviews$
        .subscribe(e => {
          if(this.nextChangeset !== undefined) {
            this.router.navigate(['changesets', this.nextChangeset.osmId, 'details'])
          } else {
            this.messageService.add(this.endOfListReachedText, 'info');
            this.router.navigate(['/changesets']);
          }
        });
    this.route.data
        .subscribe((data: {changeset: ChangesetDetails}) => {
          this.currentChangeset = data.changeset.changeset;
          this.currentChangesetDetails = data.changeset;
          this.prevChangeset = this.changesetService.getPrevChangeset(this.currentChangeset);
          this.nextChangeset = this.changesetService.getNextChangeset(this.currentChangeset);
        });
  }
}

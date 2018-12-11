import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
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
  @Input() prevChangesetId: number;
  @Input() nextChangesetId: number;

  @Output() idChange = new EventEmitter<number>();

  currentChangeset: Changeset;
  currentChangesetDetails: ChangesetDetails;


  reviewStatus = ReviewStatus;
  extern: boolean = false;

  private endOfListReachedText: string;

  constructor(
              private changesetService: ChangesetService,
              private changesetDetailsService: ChangesetDetailsService,
              private reviewService: ReviewService,
              private router: Router,
              private route: ActivatedRoute,
              private messageService: MessageService,
              private translate: TranslateService) { 
   }

  assignChangeset(data: ChangesetDetails) {
    this.currentChangeset = data.changeset;
    this.currentChangesetDetails = data;
  }

  changeId(){
    this.idChange.emit(this.nextChangesetId);
  }

  ngOnInit() {
    this.translate.get('END OF LIST REACHED').subscribe((res: string) => {
      this.endOfListReachedText = res;
    });
    this.reviewService.refreshReviews$
        .subscribe(e => {
          if(this.nextChangesetId !== undefined) {
            this.changeId();
          } else {
            this.messageService.add(this.endOfListReachedText, 'info');
            this.router.navigate(['/changesets']);
          }
        });

    if (this.id === undefined) {
      this.extern = true;
      this.route.data
          .subscribe((data: {changeset: ChangesetDetails}) => {
            this.currentChangeset = data.changeset.changeset;
            this.currentChangesetDetails = data.changeset;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['id']) {
      this.id = changes['id'].currentValue;
      this.changesetDetailsService.getChangesetDetails(this.id)
        .subscribe(changeset => { 
           this.assignChangeset(changeset)
          }, osmId => this.id);
    }    

    if (changes['nextChangesetId']) {
      this.nextChangesetId = changes['nextChangesetId'].currentValue;
    }

    if (changes['prevChangesetId']) {
      this.prevChangesetId = changes['prevChangesetId'].currentValue;
    }
   
   }
}

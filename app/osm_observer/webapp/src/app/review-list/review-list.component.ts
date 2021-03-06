import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Review, ReviewStatus } from '../types/review';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.sass']
})
export class ReviewListComponent implements OnChanges {
  @Input()
  id: number;

  reviews: Review[];
  reviewStatus = ReviewStatus;

  constructor(private reviewService: ReviewService) {
    reviewService.refreshReviews$.subscribe(
      e => this.getReviews());
  }

  assignReviews(reviews: Review[]) {
    this.reviews = reviews;
  }

  getReviews(): void {
    this.reviewService.getReviews(this.id)
                      .subscribe(
                        reviews => this.assignReviews(reviews),
                        // TODO define onError actions
                        err => {}
                      );
  }

  ngOnChanges(changes: SimpleChanges) {
    this.id = changes['id'].currentValue;
    this.getReviews();
  }
}

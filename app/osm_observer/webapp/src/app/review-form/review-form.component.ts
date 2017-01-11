import { Component, OnInit, Input } from '@angular/core';

import { Review, ReviewStatus } from '../review';
import { ReviewService } from '../review.service';

@Component({
  selector: 'review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.sass']
})
export class ReviewFormComponent implements OnInit {
  @Input()
  id: number;

  model = new Review();
  reviewStatus = ReviewStatus;

  constructor(private reviewService: ReviewService) { }

  ngOnInit() {
  }

  onSubmit() {
    this.reviewService.addReview(this.id, this.model)
                      // TODO define onError actions
                      .catch(error => {});
  };
}

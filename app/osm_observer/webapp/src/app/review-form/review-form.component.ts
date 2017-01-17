import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Review, ReviewStatus } from '../types/review';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.sass']
})
export class ReviewFormComponent implements OnInit, OnChanges {
  @Input() id: number;

  model = new Review();
  reviewStatus = ReviewStatus;

  constructor(private reviewService: ReviewService) { }

  ngOnInit() {
  }

  onSubmit() {
    this.reviewService.addReview(this.id, this.model)
                      .then(v => {
                        this.model = new Review();
                      })
                      .catch(error => {});
    return false;
  };

  ngOnChanges(changes: SimpleChanges) {
    this.id = changes['id'].currentValue;
  }
}

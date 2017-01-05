import { Component, OnInit, Input } from '@angular/core';

import { Review } from '../review';
import { ReviewService } from '../review.service';

@Component({
  selector: 'review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.sass']
})
export class ReviewListComponent implements OnInit {
  @Input()
  id: number;

  reviews: Review[];

  constructor(private reviewService: ReviewService) { }

  assignReviews(reviews: Review[]) {
    this.reviews = reviews;
  }

  getReviews(): void {
    this.reviewService.getReviews(this.id)
                      .then(reviews => this.assignReviews(reviews))
  }

  ngOnInit() {
    this.getReviews();
  }

}

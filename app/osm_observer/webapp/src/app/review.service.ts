import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Review } from './review';

@Injectable()
export class ReviewService {

  private reviewsUrl(id: number): string {
    return `/api/reviews/${id}`;
  }
  private addReviewUrl(id: number): string {
    return `/api/reviews/${id}/add`;
  }

  constructor(private http: Http) { }

  getReviews(changesetId: number): Promise<Review[]> {
    return this.http.get(this.reviewsUrl(changesetId))
                    .toPromise()
                    .then(response => response.json() as Review[])
                    .catch(this.handleError);
  }

  addReview(changesetId: number, review: Review): Promise<Review> {
    return this.http.post(this.addReviewUrl(changesetId), review)
                    .toPromise()
                    .then(response => response.json() as Review)
                    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}

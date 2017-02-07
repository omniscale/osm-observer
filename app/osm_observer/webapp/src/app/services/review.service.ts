import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/toPromise';
import { Subject }    from 'rxjs/Subject';
import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { Review } from '../types/review';

@Injectable()
export class ReviewService extends BaseHttpService {

  private reviewsUrl(id: number): string {
    return `api/reviews/${id}`;
  }
  private addReviewUrl(id: number): string {
    return `api/reviews/${id}/add`;
  }

  private refreshReviewsSource = new Subject<boolean>();
  refreshReviews$ = this.refreshReviewsSource.asObservable();

  constructor(router: Router, private http: Http, cookieService: CookieService) {
    super(router, cookieService);
  }

  getReviews(changesetId: number): Promise<Review[]> {
    let url = this.reviewsUrl(changesetId);
    return this.http.get(url, this.getRequestOptions())
                    .toPromise()
                    .then(response => response.json() as Review[])
                    .catch(error => {
                      return this.handleError(error, 'getReviews', url);
                    });
  }

  addReview(changesetId: number, review: Review): Promise<Review> {
    let url = this.addReviewUrl(changesetId);
    return this.http.post(url, review, this.getRequestOptions())
                    .toPromise()
                    .then(response => this.handleAddReviewResponse(response))
                    .catch(error => {
                      return this.handleError(error, 'addReview', url, review);
                    });
  }

  private handleAddReviewResponse(response: any): Review {
    this.refreshReviewsSource.next(true);
    return response.json() as Review;
  }
}

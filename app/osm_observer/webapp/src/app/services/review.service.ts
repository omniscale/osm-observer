import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/Rx';
import { Subject }    from 'rxjs/Subject';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { Review } from '../types/review';

@Injectable()
export class ReviewService extends BaseHttpService {

  private reviewsUrl(id: number): string {
    return this.location.prepareExternalUrl(`api/reviews/${id}`);
  }
  private addReviewUrl(id: number): string {
    return this.location.prepareExternalUrl(`api/reviews/${id}/add`);
  }

  private refreshReviewsSource = new Subject<boolean>();
  refreshReviews$ = this.refreshReviewsSource.asObservable();

  constructor(router: Router, private http: Http, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
  }

  getReviews(changesetId: number): Observable<Review[]> {
    let url = this.reviewsUrl(changesetId);
    return this.http.get(url, this.getRequestOptions())
                    .map((response:Response) => response.json() as Review[])
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'getReview', url)
                    ));
  }

  addReview(changesetId: number, review: Review): Observable<Review> {
    let url = this.addReviewUrl(changesetId);
    return this.http.post(url, review, this.getRequestOptions())
                    .map((response:Response) => this.handleAddReviewResponse(response))
                    .catch((error:any) => Observable.throw(this.handleError(error, 'addReview', url, review)));
  }

  private handleAddReviewResponse(response: any): Review {
    this.refreshReviewsSource.next(true);
    return response.json() as Review;
  }
}

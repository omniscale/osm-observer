
import {throwError as observableThrowError,  Observable ,  Subject } from 'rxjs';
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { map, catchError, } from 'rxjs/operators';

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

  constructor(router: Router, private http: HttpClient, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
  }

  getReviews(changesetId: number): Observable<Review[]> {
    let url = this.reviewsUrl(changesetId);
    return this.http.get<Review[]>(url, this.httpOptions)
      .pipe(
        (catchError((error:any) => observableThrowError(
          this.handleError(error, 'getReview', url)
      ))));
  }

  addReview(changesetId: number, review: Review): Observable<Review> {
    let url = this.addReviewUrl(changesetId);
    return this.http.post(url, review, this.httpOptions)
                    .pipe(map((response: any) => this.handleAddReviewResponse(response)),
                    catchError((error:any) => observableThrowError(this.handleError(error, 'addReview', url, review))));
  }

  private handleAddReviewResponse(response: any): Review {
    this.refreshReviewsSource.next(true);
    return response.json() as Review;
  }
}

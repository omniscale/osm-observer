import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common'

import { Observable } from 'rxjs/Rx';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { ReviewBotConfig } from '../types/review-bot-config';

@Injectable()
export class ReviewBotConfigService extends BaseHttpService {

  private reviewBotConfigsUrl(): string {
    return this.location.prepareExternalUrl('api/review-bot-configs');
  }
  private addReviewBotConfigUrl(): string {
    return this.location.prepareExternalUrl('/api/review-bot-configs/add');
  }
  private reviewBotConfigUrl(id: number): string {
    return this.location.prepareExternalUrl(`api/review-bot-configs/${id}`);
  };
  private updateReviewBotConfigUrl(id: number): string {
    return this.location.prepareExternalUrl(`api/review-bot-configs/${id}/update`);
  }
  private deleteReviewBotConfigUrl(id: number): string {
    return this.location.prepareExternalUrl(`api/review-bot-configs/${id}/delete`);
  }

  constructor(router: Router, private http: Http, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
  }

  getReviewBotConfigs(): Observable<ReviewBotConfig[]> {
    return this.http.get(this.reviewBotConfigsUrl(), this.getRequestOptions())
                    .map((response:Response) => response.json() as ReviewBotConfig[])
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'getReviewBotConfigs', this.reviewBotConfigsUrl())
                    ));
  }

  getReviewBotConfig(reviewBotId: number): Observable<ReviewBotConfig> {
    let url = this.reviewBotConfigUrl(reviewBotId);
    return this.http.get(url, this.getRequestOptions())
                    .map((response:Response) => response.json() as ReviewBotConfig)
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'getReviewBotConfig', url, {id: reviewBotId})
                    ));
  }

  addReviewBotConfig(reviewBotConfig: ReviewBotConfig): Observable<ReviewBotConfig> {
    return this.http.post(this.addReviewBotConfigUrl(), reviewBotConfig, this.getRequestOptions())
                    .map((response:Response) => response.json() as ReviewBotConfig)
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'addReviewBotConfig', this.addReviewBotConfigUrl(), reviewBotConfig)
                    ));
  }

  updateReviewBotConfig(reviewBotConfig: ReviewBotConfig): Observable<ReviewBotConfig> {
    let url = this.updateReviewBotConfigUrl(reviewBotConfig.id);
    return this.http.post(url, reviewBotConfig, this.getRequestOptions())
                    .map((response:Response) => response.json() as ReviewBotConfig)
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'updateReviewBotConfig', url, reviewBotConfig)
                    ));
  }

  deleteReviewBotConfig(id: number): Observable<any> {
    let url = this.deleteReviewBotConfigUrl(id);
    return this.http.get(url, this.getRequestOptions())
                    .catch((error:any) => Observable.throw(
                      this.handleError(error, 'deleteReviewBotConfig', url, {id: id})
                    ));
  }
}

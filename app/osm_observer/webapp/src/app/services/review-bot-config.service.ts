import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/toPromise';
import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { ReviewBotConfig } from '../types/review-bot-config';

@Injectable()
export class ReviewBotConfigService extends BaseHttpService {

  private reviewBotConfigsUrl = '/api/review-bot-configs';
  private addReviewBotConfigUrl = '/api/review-bot-configs/add';
  private reviewBotConfigUrl(id: number): string {
    return `/api/review-bot-configs/${id}`;
  };
  private updateReviewBotConfigUrl(id: number): string {
    return `/api/review-bot-configs/${id}/update`;
  }
  private deleteReviewBotConfigUrl(id: number): string {
    return `/api/review-bot-configs/${id}/delete`;
  }

  constructor(router: Router, private http: Http, cookieService: CookieService) {
    super(router, cookieService);
  }

  getReviewBotConfigs(): Promise<ReviewBotConfig[]> {
    return this.http.get(this.reviewBotConfigsUrl, this.getRequestOptions())
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig[])
                    .catch(error => {
                      return this.handleError(error, 'getReviewBotConfigs', this.reviewBotConfigsUrl);
                    });
  }

  getReviewBotConfig(reviewBotId: number): Promise<ReviewBotConfig> {
    let url = this.reviewBotConfigUrl(reviewBotId);
    return this.http.get(url, this.getRequestOptions())
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(error => {
                      return this.handleError(error, 'getReviewBotConfig', url, {id: reviewBotId});
                    });
  }

  addReviewBotConfig(reviewBotConfig: ReviewBotConfig): Promise<ReviewBotConfig> {
    return this.http.post(this.addReviewBotConfigUrl, reviewBotConfig, this.getRequestOptions())
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(error => {
                      return this.handleError(error, 'addReviewBotConfig', this.addReviewBotConfigUrl, reviewBotConfig);
                    });
  }

  updateReviewBotConfig(reviewBotConfig: ReviewBotConfig): Promise<ReviewBotConfig> {
    let url = this.updateReviewBotConfigUrl(reviewBotConfig.id);
    return this.http.post(url, reviewBotConfig, this.getRequestOptions())
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(error => {
                      return this.handleError(error, 'updateReviewBotConfig', url, reviewBotConfig);
                    });
  }

  deleteReviewBotConfig(id: number): Promise<any> {
    let url = this.deleteReviewBotConfigUrl(id);
    return this.http.get(url, this.getRequestOptions())
                    .toPromise()
                    .catch(error => {
                      return this.handleError(error, 'deleteReviewBotConfig', url, {id: id});
                    });
  }
}

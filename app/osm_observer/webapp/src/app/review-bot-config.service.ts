import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { BaseHttpService } from './base-http.service';
import { ReviewBotConfig } from './review-bot-config';

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

  constructor(private http: Http) {
    super();
  }

  getReviewBotConfigs(): Promise<ReviewBotConfig[]> {
    return this.http.get(this.reviewBotConfigsUrl, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig[])
                    .catch(error => {
                      return this.handleError(error, 'getReviewBotConfigs', this.reviewBotConfigsUrl);
                    });
  }

  getReviewBotConfig(reviewBotId: number): Promise<ReviewBotConfig> {
    let url = this.reviewBotConfigUrl(reviewBotId);
    return this.http.get(url, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(error => {
                      return this.handleError(error, 'getReviewBotConfig', url, {id: reviewBotId});
                    });
  }

  addReviewBotConfig(reviewBotConfig: ReviewBotConfig): Promise<ReviewBotConfig> {
    return this.http.post(this.addReviewBotConfigUrl, reviewBotConfig, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(error => {
                      return this.handleError(error, 'addReviewBotConfig', this.addReviewBotConfigUrl, reviewBotConfig);
                    });
  }

  updateReviewBotConfig(reviewBotConfig: ReviewBotConfig): Promise<ReviewBotConfig> {
    let url = this.updateReviewBotConfigUrl(reviewBotConfig.id);
    return this.http.post(url, reviewBotConfig, this.defaultRequestOptions)
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(error => {
                      return this.handleError(error, 'updateReviewBotConfig', url, reviewBotConfig);
                    });
  }

  deleteReviewBotConfig(id: number): Promise<any> {
    let url = this.deleteReviewBotConfigUrl(id);
    return this.http.get(url, this.defaultRequestOptions)
                    .toPromise()
                    .catch(error => {
                      return this.handleError(error, 'deleteReviewBotConfig', url, {id: id});
                    });
  }
}

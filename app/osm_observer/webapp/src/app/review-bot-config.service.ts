import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ReviewBotConfig } from './review-bot-config';

@Injectable()
export class ReviewBotConfigService {

  private reviewBotConfigsUrl = '/api/review-bot-configs';
  private addReviewBotConfigUrl = '/api/review-bot-configs/add';
  private reviewBotConfigUrl(id: number): string {
    return `/api/review-bot-configs/${id}`;
  };
  private updateReviewBotConfigUrl(id: number): string {
    return `/api/review-bot-configs/${id}/update`;
  }

  constructor(private http: Http) { }

  getReviewBotConfigs(): Promise<ReviewBotConfig[]> {
    return this.http.get(this.reviewBotConfigsUrl)
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig[])
                    .catch(this.handleError);
  }

  getReviewBotConfig(reviewBotId: number): Promise<ReviewBotConfig> {
    return this.http.get(this.reviewBotConfigUrl(reviewBotId))
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(this.handleError);
  }

  addReviewBotConfig(reviewBotConfig: ReviewBotConfig): Promise<ReviewBotConfig> {
    return this.http.post(this.addReviewBotConfigUrl, reviewBotConfig)
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(this.handleError);
  }

  updateReviewBotConfig(reviewBotConfig: ReviewBotConfig): Promise<ReviewBotConfig> {
    return this.http.post(this.updateReviewBotConfigUrl(reviewBotConfig.id), reviewBotConfig)
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig)
                    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}

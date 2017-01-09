import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ReviewBotConfig } from './review-bot-config';

@Injectable()
export class ReviewBotConfigService {

  private reviewBotsUrl = '/api/bots';

  constructor(private http: Http) { }

  getReviewBots(): Promise<ReviewBotConfig[]> {
    return this.http.get(this.reviewBotsUrl)
                    .toPromise()
                    .then(response => response.json() as ReviewBotConfig[])
                    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}

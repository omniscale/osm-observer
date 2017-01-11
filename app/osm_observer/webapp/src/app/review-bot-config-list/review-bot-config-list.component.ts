import { Component, OnInit } from '@angular/core';

import { ReviewBotConfig } from '../types/review-bot-config';
import { ReviewBotConfigService } from '../services/review-bot-config.service';

@Component({
  selector: 'review-bot-config-list',
  templateUrl: './review-bot-config-list.component.html',
  styleUrls: ['./review-bot-config-list.component.sass']
})
export class ReviewBotConfigListComponent implements OnInit {

  reviewBotConfigs: ReviewBotConfig[];

  constructor(private reviewBotConfigService: ReviewBotConfigService) { }

  assignReviewBotConfigs(reviewBotConfigs: ReviewBotConfig[]) {
    this.reviewBotConfigs = reviewBotConfigs;
  }

  getReviewBotConfigs(): void {
    this.reviewBotConfigService.getReviewBotConfigs()
                         .then(reviewBotConfigs => this.assignReviewBotConfigs(reviewBotConfigs))
                         // TODO define onError actions
                         .catch((error) => {});
  }

  deleteReviewBotConfig(id: number): void {
    this.reviewBotConfigService.deleteReviewBotConfig(id)
                               .then(v => {
                                 this.getReviewBotConfigs();
                               })
                               // TODO define onError actions
                               .catch(error => {});
  }

  ngOnInit() {
    this.getReviewBotConfigs();
  }

}

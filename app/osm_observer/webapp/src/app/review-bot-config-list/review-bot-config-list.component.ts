import { Component, OnInit } from '@angular/core';

import { ReviewBotConfig } from '../review-bot-config';
import { ReviewBotConfigService } from '../review-bot-config.service';

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
    this.reviewBotConfigService.getReviewBots()
                         .then(reviewBotConfigs => this.assignReviewBotConfigs(reviewBotConfigs));
  }

  ngOnInit() {
    this.getReviewBotConfigs();
  }

}

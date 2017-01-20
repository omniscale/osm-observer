import { Component, OnInit } from '@angular/core';

import { TranslateService } from 'ng2-translate';

import { ReviewBotConfig } from '../types/review-bot-config';
import { ReviewBotConfigService } from '../services/review-bot-config.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'review-bot-config-list',
  templateUrl: './review-bot-config-list.component.html',
  styleUrls: ['./review-bot-config-list.component.sass']
})
export class ReviewBotConfigListComponent implements OnInit {

  reviewBotConfigs: ReviewBotConfig[];

  private botConfigRemovedText: string;

  constructor(private reviewBotConfigService: ReviewBotConfigService, private messageService: MessageService, private translate: TranslateService) { }

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
                                 this.messageService.add(this.botConfigRemovedText, 'success');
                                 this.getReviewBotConfigs();
                               })
                               // TODO define onError actions
                               .catch(error => {});
  }

  ngOnInit() {
    this.translate.get('BOT CONFIG REMOVED').subscribe((res: string) => {
      this.botConfigRemovedText = res;
    });
    this.getReviewBotConfigs();
  }

}

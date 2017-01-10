import { Component, OnInit } from '@angular/core';

import { ReviewBotConfig, DefaultBotConfig, UsernameBotConfig, TagValueBotConfig } from '../review-bot-config';
import { ReviewBotConfigService } from '../review-bot-config.service';

@Component({
  selector: 'app-review-bot-config-form',
  templateUrl: './review-bot-config-form.component.html',
  styleUrls: ['./review-bot-config-form.component.sass']
})
export class ReviewBotConfigFormComponent implements OnInit {

  botNames = ['UsernameReviewBot', 'TagValueReviewBot'];

  model = new ReviewBotConfig();

  constructor(private reviewBotConfigService: ReviewBotConfigService) { }

  ngOnInit() {
  }

  setBotConfig() {
    switch(this.model.botName) {
      case 'UsernameReviewBot':
        this.model.config = new UsernameBotConfig();
        break;
      case 'TagValueReviewBot':
        this.model.config = new TagValueBotConfig();
        break;
      default:
        this.model.config = new DefaultBotConfig();
    }
  }

  onSubmit() {
    this.reviewBotConfigService.addReviewBotConfig(this.model);
  }

}

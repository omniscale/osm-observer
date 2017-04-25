import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {TranslateService} from 'ng2-translate';

import { ReviewBotConfig, DefaultBotConfig, UsernameBotConfig, TagValueBotConfig } from '../types/review-bot-config';
import { ReviewBotConfigService } from '../services/review-bot-config.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-review-bot-config-form',
  templateUrl: './review-bot-config-form.component.html',
  styleUrls: ['./review-bot-config-form.component.sass']
})
export class ReviewBotConfigFormComponent implements OnInit {

  botNames = ['UsernameReviewBot', 'TagValueReviewBot'];

  model = new ReviewBotConfig();

  update = false;

  private botConfigAddedText: string;
  private botConfigUpdatedText: string;

  constructor(private reviewBotConfigService: ReviewBotConfigService,
              private messageService: MessageService,
              private translate: TranslateService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.translate.get('BOT CONFIG ADDED').subscribe((res: string) => {
      this.botConfigAddedText = res;
    });
    this.translate.get('BOT CONFIG UPDATED').subscribe((res: string) => {
      this.botConfigUpdatedText = res;
    });
    let id = this.route.snapshot.params['id'];
    if(id !== undefined) {
      this.reviewBotConfigService.getReviewBotConfig(+id)
                                 .subscribe(
                                   (reviewBotConfig: ReviewBotConfig) => {
                                    this.model = reviewBotConfig;
                                    this.update = true;
                                   },
                                   // TODO define onError actions
                                   error => {
                                     this.router.navigate(['/reviewBotConfigs']);
                                   }
                                 );
    }
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

  hasFormError(field) {
    return field !== undefined && field.touched && field.invalid;
  }

  onSubmit() {
    if(this.update) {
      this.reviewBotConfigService.updateReviewBotConfig(this.model)
          .subscribe(
            v => {
              this.router.navigate(['/reviewBotConfigs']);
              this.messageService.add(this.botConfigUpdatedText, 'success');
            },
            // TODO define onError actions
            error => {}
          );
    } else {
      this.reviewBotConfigService.addReviewBotConfig(this.model)
          .subscribe(
            v => {
              this.router.navigate(['/reviewBotConfigs']);
              this.messageService.add(this.botConfigAddedText, 'success');
            },
            // TODO define onError actions
            e => {}
          );
    }
    return false;
  }

  onCancel() {
    this.router.navigate(['/reviewBotConfigs']);
  }
}

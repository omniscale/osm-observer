import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { ReviewBotConfig, DefaultBotConfig, UsernameBotConfig, TagValueBotConfig } from '../types/review-bot-config';
import { ReviewBotConfigService } from '../services/review-bot-config.service';

@Component({
  selector: 'app-review-bot-config-form',
  templateUrl: './review-bot-config-form.component.html',
  styleUrls: ['./review-bot-config-form.component.sass']
})
export class ReviewBotConfigFormComponent implements OnInit {

  botNames = ['UsernameReviewBot', 'TagValueReviewBot'];

  model = new ReviewBotConfig();

  update = false;

  constructor(private reviewBotConfigService: ReviewBotConfigService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    let id = this.route.snapshot.params['id'];
    if(id !== undefined) {
      this.reviewBotConfigService.getReviewBotConfig(+id)
                                 .then((reviewBotConfig: ReviewBotConfig) => {
                                    this.model = reviewBotConfig;
                                    this.update = true;
                                  })
                                 // TODO define onError actions
                                 .catch(e => {
                                   this.router.navigate(['/reviewBotConfigs']);
                                 });
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

  onSubmit() {
    if(this.update) {
      this.reviewBotConfigService.updateReviewBotConfig(this.model)
          .then(v => {
            this.router.navigate(['/reviewBotConfigs']);
          })
          // TODO define onError actions
          .catch(e => {});
    } else {
      this.reviewBotConfigService.addReviewBotConfig(this.model)
          .then(v => {
            this.router.navigate(['/reviewBotConfigs']);
          })
          // TODO define onError actions
          .catch(e => {});
    }
    return false;
  }

  onCancel() {
    this.router.navigate(['/reviewBotConfigs']);
  }

}

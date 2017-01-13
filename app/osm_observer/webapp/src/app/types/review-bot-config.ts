export class ReviewBotConfig {
  id: number;
  active: boolean;
  botName: string;
  config: DefaultBotConfig;

  constructor(id?: number, active?: boolean, botName?: string, config?: DefaultBotConfig) {
    if(config === undefined) {
      switch(this.botName) {
        case 'UsernameReviewBot':
          this.config = new UsernameBotConfig();
          break;
        case 'TagValueReviewBot':
          this.config = new TagValueBotConfig();
          break;
        default:
          this.config = new DefaultBotConfig();
      }
    }
    this.active = active === undefined ? false : active;
  }
}

export class DefaultBotConfig {
  [propName: string]: any;
}

export class UsernameBotConfig {
  username: string;
  comment: string;
  score: number;
}

export class TagValueBotConfig {
  tag: string;
  value: string;
  comment: string;
  score: string;
}

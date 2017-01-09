export class ReviewBotConfig {
  id: number;
  active: boolean;
  botName: string;
  config: BotConfig;
}

export class BotConfig {
  [propName: string]: any;
}

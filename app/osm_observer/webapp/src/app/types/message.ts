export class Message {
  message: string;
  type: string;
  timeout: number;

  constructor(message: string, type: string) {
    this.message = message;
    this.type = type;
  }
}

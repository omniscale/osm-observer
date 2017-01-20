import { Component } from '@angular/core';

import { MessageService } from '../services/message.service';
import { Message } from '../types/message';

@Component({
  selector: 'message-viewer',
  templateUrl: './message-viewer.component.html',
  styleUrls: ['./message-viewer.component.sass']
})
export class MessageViewerComponent {

  messages: Message[] = [];

  constructor(private messageService: MessageService) {
    this.messageService.getMessages().subscribe(
      message => this.showMessage(message)
    );
  }

  showMessage(message: Message): void {
    if(message.type !== 'error') {
      message.timeout = window.setTimeout(() => {
        this.close(message)
      }, 2000);
    }
    this.messages.push(message);
  }

  close(message: Message): void {
    let idx = this.messages.indexOf(message);
    if(message.timeout !== undefined) {
      window.clearTimeout(message.timeout);
    }
    if(idx > -1) {
      this.messages.splice(idx, 1);
    }
  }
}

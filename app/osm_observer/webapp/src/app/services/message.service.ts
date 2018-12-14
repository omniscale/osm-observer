import { Injectable } from '@angular/core'
import { Observable ,  Subject } from 'rxjs'

import { Message } from '../types/message';

@Injectable()
export class MessageService {
    newMessages: Subject<Message> = new Subject<Message>();

    constructor() {}

    add(message: string, type: string ) {
        this.newMessages.next(new Message(
            message,
            type
        ));

    }
    getMessages(): Subject<Message> {
        return this.newMessages;
    }
}

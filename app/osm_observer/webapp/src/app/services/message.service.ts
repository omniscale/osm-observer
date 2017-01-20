import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

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

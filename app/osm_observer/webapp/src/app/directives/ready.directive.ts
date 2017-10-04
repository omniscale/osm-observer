import { Directive, Input, EventEmitter } from '@angular/core';

@Directive({
  selector: '[ready]',
  outputs: ['onReady']
})
export class ReadyDirective {

  onReady = new EventEmitter();

  constructor() { }

  @Input()
  set ready(isReady: boolean) {
    if(isReady === true) {
      this.onReady.emit('ready');
    }
  }
}

import { Injectable, Output, EventEmitter } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';

@Injectable()
export class MapService {

  currentChange: ChangesetChange;
  currentChangeType: String;

  @Output() change: EventEmitter<{change: ChangesetChange, type: String}> = new EventEmitter();

  activeChange(change: ChangesetChange, type: String) {
    this.currentChange = change;
    this.currentChangeType = type;
    this.change.emit({change: this.currentChange, type: this.currentChangeType });
  }
}
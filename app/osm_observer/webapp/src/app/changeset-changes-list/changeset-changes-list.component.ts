import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetDetails } from '../types/changeset-details';
import { MapService } from '../services/map.service';

@Component({
  selector: 'changeset-changes-list',
  templateUrl: './changeset-changes-list.component.html',
  styleUrls: ['./changeset-changes-list.component.sass']
})
export class ChangesetChangesListComponent implements OnChanges {

  @Input() changeset: ChangesetDetails;

  currentChange: ChangesetChange;
  currentChangeType: String;

  selectedChange: ChangesetChange;
  selectedChangeType: String;
  selectedChangeShow: boolean;

  constructor(private mapService: MapService) { }

  getSelectedChange() {
    this.selectedChangeShow = true;
    this.currentChange = undefined;
  }

  setSelectedChange(change: ChangesetChange, type: String) {
    this.mapService.activeChange(change, type);
    this.selectedChange = change;
    this.selectedChangeType = type;
  }
  
  updateCurrentChange(change: ChangesetChange, type: String) {
    this.currentChange = change;
    this.currentChangeType = type;
    this.selectedChangeShow = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['changeset']) {
      this.changeset = changes['changeset'].currentValue;
    }
  }

}

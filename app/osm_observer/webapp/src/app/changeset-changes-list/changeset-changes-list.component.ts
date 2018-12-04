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

  constructor(private mapService: MapService) { }

  updateCurrentChange(change: ChangesetChange, type: String) {
    this.mapService.activeChange(change, type);
    this.currentChange = change;
    this.currentChangeType = type;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
  }
}

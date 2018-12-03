import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetDetailsService } from '../services/changeset-details.service';

@Component({
  selector: 'changeset-changes-list',
  templateUrl: './changeset-changes-list.component.html',
  styleUrls: ['./changeset-changes-list.component.sass']
})
export class ChangesetChangesListComponent implements OnChanges {

  @Input() changeset: ChangesetDetails;

  currentChange: ChangesetChange;
  currentChangeType: String;

  constructor(private changesetDetailsService: ChangesetDetailsService) { }

  updateCurrentChange(changeset: ChangesetChange, changesetType: String) {
    this.currentChange = changeset;
    this.currentChangeType = changesetType;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
  }
}

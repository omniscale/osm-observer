import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetService } from '../services/changeset.service';

@Component({
  selector: 'changeset-changes-list',
  templateUrl: './changeset-changes-list.component.html',
  styleUrls: ['./changeset-changes-list.component.sass']
})
export class ChangesetChangesListComponent implements OnChanges {

  @Input() id: number;

  changesetNodeChanges: ChangesetChange[];
  changesetWayChanges: ChangesetChange[];
  changesetRelationChanges: ChangesetChange[];

  constructor(private changesetService: ChangesetService) { }

  assignChangesetChanges(changesetChanges: ChangesetChange[]) {
    this.changesetNodeChanges = [];
    this.changesetWayChanges = [];
    this.changesetRelationChanges = [];
    for (let change of changesetChanges) {
      switch(change.type) {
        case 'node':
          this.changesetNodeChanges.push(change);
          break;
        case 'way':
          this.changesetWayChanges.push(change);
          break;
        case 'relation':
          this.changesetRelationChanges.push(change);
          break;
      }
    }
  }

  getChangesetChanges(): void {
    this.changesetService.getChangesetChanges(this.id)
                         .then(changesetChanges => this.assignChangesetChanges(changesetChanges))
                         // TODO define onError actions
                         .catch(error => {});
  }

  ngOnChanges(changes: SimpleChanges) {
    this.id = changes['id'].currentValue;
    this.getChangesetChanges();
  }
}

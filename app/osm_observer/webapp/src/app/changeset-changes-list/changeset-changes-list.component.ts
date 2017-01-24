import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { Changes } from '../types/changes';
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

  nodesChanges: Changes;
  waysChanges: Changes;
  relationsChanges: Changes;

  constructor(private changesetService: ChangesetService) { }

  assignChangesetChanges(changesetChanges: ChangesetChange[]) {
    this.changesetNodeChanges = [];
    this.changesetWayChanges = [];
    this.changesetRelationChanges = [];

    this.nodesChanges = new Changes();
    this.waysChanges = new Changes();
    this.relationsChanges = new Changes();

    let changes: Changes;
    for (let change of changesetChanges) {
      switch(change.type) {
        case 'node':
          changes = this.nodesChanges;
          this.changesetNodeChanges.push(change);
          break;
        case 'way':
          changes= this.waysChanges;
          this.changesetWayChanges.push(change);
          break;
        case 'relation':
          changes = this.relationsChanges;
          this.changesetRelationChanges.push(change);
          break;
      }
      if(change.added) {
        changes.added++;
      }
      if(change.modified) {
        changes.modified++;
      }
      if(change.deleted) {
        changes.deleted++;
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

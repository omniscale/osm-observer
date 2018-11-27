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

  // changesetNodeChanges: ChangesetChange[];
  // changesetWayChanges: ChangesetChange[];
  // changesetRelationChanges: ChangesetChange[];

  // nodesChanges: Changes;
  // waysChanges: Changes;
  // relationsChanges: Changes;

  constructor(private changesetDetailsService: ChangesetDetailsService) { }

  assignChangesetChanges(changesetChanges: ChangesetDetails) {
    // this.changesetNodeChanges = [];
    // this.changesetWayChanges = [];
    // this.changesetRelationChanges = [];

    // // this.nodesChanges = new Changes();
    // // this.waysChanges = new Changes();
    // // this.relationsChanges = new Changes();
    // console.log(changesetChanges)
    // let changes: Changes;
    // for (let change of changesetChanges.changes) {
    //    console.log(change)
      // switch(change.type) {
      //   case 'node':
      //     changes = this.nodesChanges;
      //     this.changesetNodeChanges.push(change);
      //     break;
      //   case 'way':
      //     changes= this.waysChanges;
      //     this.changesetWayChanges.push(change);
      //     break;
      //   case 'relation':
      //     changes = this.relationsChanges;
      //     this.changesetRelationChanges.push(change);
      //     break;
      // }
      // if(change.added) {
      //   changes.added++;
      // }
      // if(change.modified) {
      //   changes.modified++;
      // }
      // if(change.deleted) {
      //   changes.deleted++;
      // }
    // }
  }

  // getChangesetChanges(): void {
  //   this.changesetDetailsService.getChangesetDetails(this.id)
  //                        .subscribe(
  //                          changesetChanges => this.assignChangesetChanges(changesetChanges),
  //                          // TODO define onError actions
  //                          error => {}
  //                        );
  // }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
    this.assignChangesetChanges(this.changeset)
  }
}

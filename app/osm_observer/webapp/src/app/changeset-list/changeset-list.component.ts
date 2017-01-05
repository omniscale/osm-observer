import { Component, OnInit } from '@angular/core';

import { Changeset } from '../changeset';
import { ChangesetService } from '../changeset.service';

@Component({
  selector: 'changeset-list',
  templateUrl: './changeset-list.component.html',
  styleUrls: ['./changeset-list.component.sass']
})
export class ChangesetListComponent implements OnInit {

  changesets: Changeset[];

  constructor(private changesetService: ChangesetService) { }

  assignChangesets(changesets: Changeset[]) {
    this.changesets = changesets;
  }

  getChangesets(): void {
    this.changesetService.getChangesets()
                         .then(changesets => this.assignChangesets(changesets));
  }

  ngOnInit() {
    this.getChangesets();
  }
}

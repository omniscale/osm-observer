import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetComment } from '../types/changeset-comment';
import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetService } from '../services/changeset.service';

@Component({
  selector: 'changeset-comment-list',
  templateUrl: './changeset-comment-list.component.html',
  styleUrls: ['./changeset-comment-list.component.sass']
})
export class ChangesetCommentListComponent implements OnChanges {

  @Input() changeset: ChangesetDetails;

  changesetComments: ChangesetComment[];

  constructor(private changesetService: ChangesetService) { }

  assignChangesetComments(changesetComments: ChangesetComment[]) {
    this.changesetComments = changesetComments;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
    this.assignChangesetComments(this.changeset.changeset.comments);
  }
}

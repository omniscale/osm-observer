import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetComment } from '../types/changeset-comment';
import { ChangesetService } from '../services/changeset.service';

@Component({
  selector: 'changeset-comment-list',
  templateUrl: './changeset-comment-list.component.html',
  styleUrls: ['./changeset-comment-list.component.sass']
})
export class ChangesetCommentListComponent implements OnInit, OnChanges {

  @Input() id: number;

  changesetComments: ChangesetComment[];

  constructor(private changesetService: ChangesetService) { }

  assignChangesetComments(changesetComments: ChangesetComment[]) {
    this.changesetComments = changesetComments;
  }

  getChangesetComments(): void {
    this.changesetService.getChangesetComments(this.id)
                         .then(changesetComments => this.assignChangesetComments(changesetComments))
                         // TODO define onError actions
                         .catch(error => {});
  }

  ngOnChanges(changes: SimpleChanges) {
    this.id = changes['id'].currentValue;
    this.getChangesetComments();
  }

  ngOnInit() {
    this.getChangesetComments();
  }

}

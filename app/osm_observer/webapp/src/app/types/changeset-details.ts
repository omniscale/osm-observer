
import { Changeset } from './changeset';
import { ChangesetChange } from './changeset-change';
import { ChangesetElementsNode } from './changeset-elements-node';
import { ChangesetElementsWay } from './changeset-elements-way';
import { ChangesetElementsRelation } from './changeset-elements-relation';

export class ChangesetDetails {
  changes: Changes;
  elements: Elements;
  changeset: Changeset;

  constructor(
    changes: Changes, 
    elements: Elements,
    changeset: Changeset
  ) {
    this.changes = changes;
    this.elements = elements;
    this.changeset = changeset;
  }
}

export class Changes {
  nodes: ChangesetChange;
  relations: ChangesetChange;
  ways: ChangesetChange;
}

export class Elements {
  nodes: ChangesetElementsNode;
  relations: ChangesetElementsRelation;
  ways: ChangesetElementsWay;
}

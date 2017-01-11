import { Changeset } from './changeset';

export class ChangesetDetails extends Changeset {
    nodesAdd: number;
    nodesModify: number;
    nodesDelete: number;

    waysAdd: number;
    waysModify: number;
    waysDelete: number;

    relationsAdd: number;
    relationsModify: number;
    relationsDelete: number;
}

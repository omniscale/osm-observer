export class ChangesetChange {
  id: number;
  added: boolean;
  modified: boolean;
  deleted: boolean;
  key: string;
  prev_key: string;
  version: number;

  constructor(
    id: number, added: boolean, modified: boolean, deleted: boolean,
    key: string, prev_key: string, version: number
  ) {
    this.id = id;
    this.added = added;
    this.modified = modified;
    this.deleted = deleted;
    this.version = version;
    this.key = key;
    this.prev_key = prev_key;
  }
}

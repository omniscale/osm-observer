export class ChangesetChange {
  id: number;
  added: boolean;
  modified: boolean;
  deleted: boolean;
  key: string;
  prevKey: string;
  version: number;

  constructor(
    id: number, added: boolean, modified: boolean, deleted: boolean,
    key: string, prevKey: string, version: number
  ) {
    this.id = id;
    this.added = added;
    this.modified = modified;
    this.deleted = deleted;
    this.version = version;
    this.key = key;
    this.prevKey = prevKey;
  }
}

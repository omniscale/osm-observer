export class Changes {
  added: number;
  modified: number;
  deleted: number;

  constructor(added?: number, modified?: number, deleted?: number) {
    this.added = added === undefined ? 0 : added;
    this.modified = modified === undefined ? 0 : modified;
    this.deleted = deleted === undefined ? 0 : deleted;
  }
}

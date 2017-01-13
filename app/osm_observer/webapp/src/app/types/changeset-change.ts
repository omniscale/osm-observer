export class ChangesetChange {
  type: string;
  id: number;
  added: boolean;
  modified: boolean;
  deleted: boolean;
  userName: string;
  userId: number;
  timestamp: Date;
  version: number;
  tags: Tags;

  constructor(
    type: string, id: number, added: boolean, modified: boolean, deleted: boolean,
    userName: string, userId: number, timestamp: Date, version: number,
    tags: Tags
  ) {
    this.type = type;
    this.id = id;
    this.added = added;
    this.modified = modified;
    this.deleted = deleted;
    this.userName = userName;
    this.userId = userId;
    this.timestamp = new Date(timestamp);
    this.version = version;
    this.tags = tags;
  }
}

export class Tags {
  [propName: string]: any;
}

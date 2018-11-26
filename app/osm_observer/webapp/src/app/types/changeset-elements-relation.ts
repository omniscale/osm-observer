export class ChangesetElementsRelation {
  added: boolean;
  modified: boolean;
  deleted: boolean;
  id: number;
  members: Members;
  tags: Tags;
  timestamp: Date;
  userId: number;
  userName: string;
  version: number;

  constructor(
    id: number, added: boolean, modified: boolean, deleted: boolean,
    userName: string, userId: number, timestamp: Date, version: number,
    tags: Tags, members: Members
  ) {
    this.id = id;
    this.added = added;
    this.modified = modified;
    this.deleted = deleted;
    this.userName = userName;
    this.userId = userId;
    this.timestamp = new Date(timestamp);
    this.version = version;
    this.tags = tags;
    this.members = members;
  }
}

export class Tags {
  [propName: string]: any;
}

export class Members {
  [propName: string]: any;
}

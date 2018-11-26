export class ChangesetElementsWay {
  added: boolean;
  modified: boolean;
  deleted: boolean;
  id: number;
  nds: Nodes;
  tags: Tags;
  timestamp: Date;
  userId: number;
  userName: string;
  version: number;

  constructor(
    id: number, added: boolean, modified: boolean, deleted: boolean,
    userName: string, userId: number, timestamp: Date, version: number,
    tags: Tags, nds: Nodes
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
    this.nds = nds;
  }
}

export class Tags {
  [propName: string]: any;
}

export class Nodes {
  [propName: string]: any;
}

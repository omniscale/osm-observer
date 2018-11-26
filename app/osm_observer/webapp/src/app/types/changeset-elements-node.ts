export class ChangesetElementsNode {
  added: boolean;
  modified: boolean;
  deleted: boolean;
  coordinates: Array<number>; 
  id: number;
  tags: Tags;
  userId: number;
  userName: string;
  version: number;
  timestamp: Date;

  constructor(
    id: number, added: boolean, modified: boolean, deleted: boolean,
    userName: string, userId: number, timestamp: Date, version: number,
    tags: Tags, coordinates: Array<number>
  ) {
    this.id = id;
    this.coordinates = coordinates;
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

export class Changeset {
  id: number;
  osmId: number;
  createdAt: Date;
  closedAt: Date;
  numReviews: number;
  username: string;
  numChanges: number;
  userId: number;
  sumScore: number;
  tags: Tags;

  constructor(
    id: number, osmId: number, createdAt: string, closedAt: string,
    numReviews: number, username: string, numChanges: number,
    userId: number, sumScore: number, tags: Tags
  ) {
    this.id = id;
    this.osmId = osmId;
    this.numReviews = numReviews;
    this.username = username;
    this.userId = userId;
    this.numChanges = numChanges;
    this.sumScore = sumScore;
    this.tags = tags;

    this.createdAt = new Date(createdAt);
    this.closedAt = new Date(closedAt);
  }
}

export class Tags {
  [propName: string]: any;
}

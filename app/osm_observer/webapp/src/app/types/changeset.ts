import { ChangesetComment } from './changeset-comment';

export class Changeset {
  id: number;
  osmId: number;
  status: number;
  numReviews: number;

  createdAt: Date; //
  closedAt: Date; //
  userName: string; //
  numChanges: number; //
  userID: number; //
  sumScore: number;
  tags: Tags; //
  comments: ChangesetComment[]; //
  currentUserReviewed: boolean;
  changesetBBOX: Array<number>; //
  dataBBOX: Array<number>; //
  open: boolean; //

  constructor(
    id: number, osmId: number, createdAt: string, closedAt: string,
    numReviews: number, userName: string, numChanges: number,
    userID: number, sumScore: number, tags: Tags, status: number,
    currentUserReviewed: boolean, changesetBBOX: number[], dataBBOX: number[],
    comments: ChangesetComment[], open: boolean
  ) {
    this.id = id;
    this.osmId = osmId;
    this.status = status;
    this.numReviews = numReviews;
    this.userName = userName;
    this.userID = userID;
    this.numChanges = numChanges;
    this.sumScore = sumScore;
    this.tags = tags;
    this.currentUserReviewed = currentUserReviewed;
    this.changesetBBOX = changesetBBOX;
    this.comments = comments;
    this.createdAt = new Date(createdAt);
    this.closedAt = new Date(closedAt);
    this.open = open;
  }
}

export class Tags {
  [propName: string]: any;
}

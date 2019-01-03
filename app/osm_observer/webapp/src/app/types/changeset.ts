import { ChangesetComment } from './changeset-comment';
import { Review } from './review';

export class Changeset {
  id: number;
  osmId: number;
  createdAt: Date; 
  closedAt: Date; 
  userName: string; 
  numChanges: number; 
  userID: number; 
  tags: Tags; 
  comments: ChangesetComment[]; 
  changesetBBOX: Array<number>; 
  dataBBOX: Array<number>; 
  open: boolean; 
  observerReviews: Review[];

  constructor(
    id: number, osmId: number, createdAt: string, closedAt: string,
    userName: string, numChanges: number,
    userID: number, tags: Tags,
    changesetBBOX: number[], dataBBOX: number[],
    comments: ChangesetComment[], open: boolean, observerReviews: Review[]
  ) {
    this.id = id;
    this.osmId = osmId;
    this.userName = userName;
    this.userID = userID;
    this.numChanges = numChanges;
    this.tags = tags;
    this.changesetBBOX = changesetBBOX;
    this.dataBBOX = dataBBOX;
    this.comments = comments;
    this.createdAt = new Date(createdAt);
    this.closedAt = new Date(closedAt);
    this.open = open;
  }
}

export class Tags {
  [propName: string]: any;
}

export class ChangesetComment {
  changesetId: number;
  idx: number;
  userName: string;
  userId: number;
  timestamp: Date;
  text: string;

  constructor(
    changesetId: number, idx: number, userName: string, userId: number, timestamp: string, text: string
  ) {
    this.changesetId = changesetId;
    this.idx = idx;
    this.userName = userName;
    this.userId = userId;
    this.timestamp = new Date(timestamp);
    this.text = text;
  }
}

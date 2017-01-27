export class Review {
  id: number;
  score: number;
  status: number;
  comment: string;
  timeCreated: Date;
  creator: Creator;

  constructor(id?: number, score?: number, status?: number, comment?: string, timeCreated?: string, creator?: Creator) {
    this.id = id;
    this.score = score;
    this.status = status;
    this.comment = comment;
    this.timeCreated = new Date(timeCreated);
  }
}

export class Creator {
  id: number;
  name: string;
  type: string;
}

export class ReviewStatus {
  static BROKEN = 1;
  static FIXED = 50;
  static OK = 99;

  static names(): Array<string> {
    let keys:string[] = []
    for(let key of Object.keys(ReviewStatus)) {
      if(typeof(ReviewStatus[key]) !== 'function') {
        keys.push(key);
      }
    }
    return keys;
  }

  static byId(id: number): string {
    for(let key of ReviewStatus.names()) {
      if(ReviewStatus[key] === id) {
        return key;
      }
    }
    return undefined;
  }
}

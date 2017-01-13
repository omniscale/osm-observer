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

export enum ReviewStatus {
  Nothing = 0,
  Automatic = 1,
  Fixed = 99
}


export namespace ReviewStatus {
  export function names(): Array<string> {
    var keys = Object.keys(ReviewStatus);
    return keys.slice(keys.length / 2, keys.length -1);
  }
}

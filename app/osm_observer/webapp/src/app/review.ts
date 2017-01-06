export class Review {
  id: number;
  score: number;
  status: number;
  timeCreated: Date;

  constructor(id: number, score: number, status: number, timeCreated: string) {
    this.id = id;
    this.score = score;
    this.status = status;
    this.timeCreated = new Date(timeCreated);
  }
}

export enum ReviewStatus {
  Nothing = 0,
  Fixed = 99
}


export namespace ReviewStatus {
  export function names(): Array<string> {
    var keys = Object.keys(ReviewStatus);
    return keys.slice(keys.length / 2, keys.length -1);
  }
}

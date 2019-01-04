import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reviews'
})
export class ReviewPipe implements PipeTransform {
  public transform(value, content: string) {

    let entries = [];
    if (content['status']) {
      for (let item of value) {
        if (item.hasOwnProperty('observerReviews')) {
          let review = (item['observerReviews'][item['observerReviews'].length - 1])
          if (review.status === content['status']) {
            entries.push(item);
          }
        }
      }
    } else {
      entries = value;
    }

    if (content['currentUserReviewed']) {
      let userEntries = [];
      for (let item of entries) {
        if (item.hasOwnProperty('observerReviews')) {
          for (let review of item['observerReviews']) {
            if (review.userName === content['username']) {
              userEntries.push(item);
              break;
            }
          }

        }
      }
      return userEntries;
    }

    return entries;
  }
}
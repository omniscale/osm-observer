import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reviews'
})
export class ReviewPipe implements PipeTransform {
  public transform(value, content: string) {

    let entries = [];
    if (content['status']) {
      for (let idx in value) {
        let item = value[idx];
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
      for (let idx in entries) {
        let item = entries[idx];
        if (item.hasOwnProperty('observerReviews')) {
          for (let idx in item['observerReviews']) {
            userEntries.push(item);
          }
        }
      }
      return userEntries;
    }

    return entries;
  }
}
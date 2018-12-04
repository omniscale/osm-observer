import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetDetailsService } from '../services/changeset-details.service';

@Component({
  selector: 'changeset-tags-compare',
  templateUrl: './changeset-tags-compare.component.html',
  styleUrls: ['./changeset-tags-compare.component.sass']
})
export class ChangesetTagsCompareComponent implements OnChanges {

  @Input() changeset: ChangesetDetails;
  @Input() key: string;
  @Input() prevKey: string;
  @Input() type: string;
  @Input() openIntialCompare: boolean;

  showCompareTags: boolean;
  combinedTags = {};

  constructor(private changesetDetailsService: ChangesetDetailsService) {
    this.showCompareTags = false;
  }

  assignChangesets(changeset: ChangesetDetails, type: string, key: string, prevKey: string) {
    let tags = changeset.elements[type][key].tags;
    let combinedTags = {};

    for (let tag in tags) {
        combinedTags[tag] = {
          'currentValue': tags[tag],
          'prevValue': ''
        };
    }

    if (prevKey) {
        let prevTags = changeset.elements[type][key].tags;
        for (let tag in prevTags) {
            if (tag in combinedTags) {
                combinedTags[tag]['prevValue'] = prevTags[tag]  
            } else {
                combinedTags[tag] = {
                  'currentValue': '',
                  'prevValue': tags[tag]
                };
            }
        }

    }
    this.combinedTags = combinedTags;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['changeset']) {  
      this.changeset = changes['changeset'].currentValue;
    }
    if (changes['type']) {  
      this.type = changes['type'].currentValue
    }
    if (changes['openIntialCompare']) {
      this.showCompareTags = changes['openIntialCompare'].currentValue
    }

    this.key = changes['key'].currentValue;
    this.prevKey = changes['prevKey'].currentValue;

    this.assignChangesets(this.changeset, this.type, this.key, this.prevKey);
  }
}

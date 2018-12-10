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
  combinedTags: {};
  hasPrevValue: boolean;

  constructor(private changesetDetailsService: ChangesetDetailsService) {
    this.showCompareTags = false;
  }

  assignChangesets(changeset: ChangesetDetails, type: string, key: string, prevKey: string) {
    if (key === undefined) {
      return false;
    }
    let tags = changeset.elements[type][key].tags;
    let combinedTags = {};
    this.hasPrevValue = false;
    for (let tag in tags) {
        combinedTags[tag] = {
          'currentValue': tags[tag],
          'prevValue': ''
        };
    }

    if (prevKey) {
        let prevTags = changeset.elements[type][prevKey].tags;
        if (prevTags) {
          this.hasPrevValue = true;
        }
        for (let tag in prevTags) {
            if (tag in combinedTags) {
                combinedTags[tag]['prevValue'] = prevTags[tag]  
            } else {
                combinedTags[tag] = {
                  'currentValue': '',
                  'prevValue': prevTags[tag]
                };
            }
        }

    }
    this.combinedTags = combinedTags;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.combinedTags = {};
    if (changes['changeset']) {  
      this.changeset = changes['changeset'].currentValue;
      this.key = undefined;
    }
    
    if (changes['type']) {  
      this.type = changes['type'].currentValue
    }
    
    if (changes['openIntialCompare']) {
      this.showCompareTags = changes['openIntialCompare'].currentValue
    }
    
    if (changes['key']) {
      this.key = changes['key'].currentValue;
    }

    if (changes['prevKey']) {
      this.prevKey = changes['prevKey'].currentValue;
    }

    this.assignChangesets(this.changeset, this.type, this.key, this.prevKey);
  }
}

import { Component, OnInit } from '@angular/core';

import {TranslateService} from 'ng2-translate';

import { TagFilter } from '../types/tag-filter';
import { TagFilterService } from '../services/tag-filter.service'
import { MessageService } from '../services/message.service';

@Component({
  selector: 'tag-filter-list',
  templateUrl: './tag-filter-list.component.html',
  styleUrls: ['./tag-filter-list.component.sass']
})
export class TagFilterListComponent implements OnInit {

  tagFilters: TagFilter[];
  selectedFilter: TagFilter;

  private changesSavedText: string;
  private changesDiscardedText: string;

  constructor(private tagFilterService: TagFilterService, private messageService: MessageService, private translate: TranslateService) { }

  assignFilters(tagFilters: TagFilter[]) {
    this.tagFilters = tagFilters;
  }

  getFilters(): void {
    this.tagFilterService.getTagFilters()
                        .subscribe(
                          tagFilters => this.assignFilters(tagFilters),
                          // TODO define onError actions
                          error => {}
                        );
  }

  removeFilter(tagFitler: TagFilter): void {
    this.tagFilterService.removeTagFilter(tagFitler.id)
                        .subscribe(
                        v => {
                          this.messageService.add('removed', 'success');
                          this.getFilters();
                        },
                        error => {}
                      );
  }

  ngOnInit() {
    this.getFilters();
  }

}

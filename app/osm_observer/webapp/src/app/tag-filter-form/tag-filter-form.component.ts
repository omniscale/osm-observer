import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import {TranslateService} from 'ng2-translate';

import { TagFilter } from '../types/tag-filter';
import { TagFilterService } from '../services/tag-filter.service'
import { MessageService } from '../services/message.service';

import { TagFilterListComponent } from '../tag-filter-list/tag-filter-list.component';

@Component({
  selector: 'tag-filter-form',
  templateUrl: './tag-filter-form.component.html',
  styleUrls: ['./tag-filter-form.component.sass']
})
export class TagFilterFormComponent implements OnInit, OnChanges {
  @Input() selectedFilter: TagFilter;
  @Input() tagList: TagFilterListComponent;

  @ViewChild('filterForm') public filterForm: NgForm;

  filterAddedText: string;
  editFilter: boolean;
  currentFilter: TagFilter;

  model = new TagFilter();

  constructor(private tagFilterService: TagFilterService, private translate: TranslateService, private messageService: MessageService) { }

  hasFormError(field) {
    return field !== undefined && field.touched && field.invalid;
  }

  resetForm() {
    this.filterForm.reset();
    this.model = new TagFilter();
    this.editFilter = false;
  }

  assignCurrentFilter(currentFilter: TagFilter) {
    if (currentFilter) {
      var copy = Object.assign({}, currentFilter);
      this.model = copy;
      this.editFilter = true;
    }
  }

  onSubmit() {
    this.tagFilterService.saveTagFilter(this.model)
                      .subscribe(
                        v => {
                          this.model = new TagFilter();
                          this.messageService.add(this.filterAddedText, 'success');
                          this.resetForm();
                          this.tagList.getFilters();
                        },
                        error => {}
                      );
    return false;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedFilter']) {
      this.currentFilter = changes['selectedFilter'].currentValue
    }
    this.assignCurrentFilter(this.currentFilter);
  }

  ngOnInit() {
    this.translate.get('TAG FILTER ADDED').subscribe((res: string) => {
      this.filterAddedText = res;
    });
  }
}

import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import {TranslateService} from 'ng2-translate';

import { TagFilter } from '../types/tag-filter';
import { TagFilterService } from '../services/tag-filter.service'
import { MessageService } from '../services/message.service';

@Component({
  selector: 'tag-filter-form',
  templateUrl: './tag-filter-form.component.html',
  styleUrls: ['./tag-filter-form.component.sass']
})
export class TagFilterFormComponent implements OnInit, OnChanges {
  @Input() selectedFilter: TagFilter;

  @ViewChild('filterForm') public filterForm: NgForm;

  filterAddedText: string;

  model = new TagFilter();

  constructor(private tagFilterService: TagFilterService, private translate: TranslateService, private messageService: MessageService) { }

  hasFormError(field) {
    return field !== undefined && field.touched && field.invalid;
  }

  resetForm() {
    this.filterForm.reset();
  }

  onSubmit() {
    this.tagFilterService.saveTagFilter(this.model)
                      .subscribe(
                        v => {
                          this.model = new TagFilter();
                          this.messageService.add(this.filterAddedText, 'success');
                          this.filterForm.reset();
                        },
                        error => {}
                      );
    return false;
  };

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    if (changes['selectedFilter']) {
       console.log(changes['selectedFilter'].currentValue);
    }
  }

  ngOnInit() {
    this.translate.get('TAG FILTER ADDED').subscribe((res: string) => {
      this.filterAddedText = res;
    });
  }
}

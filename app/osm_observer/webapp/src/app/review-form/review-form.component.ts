import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import {TranslateService} from '@ngx-translate/core';

import { Review, ReviewStatus } from '../types/review';
import { ReviewService } from '../services/review.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.sass']
})
export class ReviewFormComponent implements OnInit, OnChanges {
  @Input() id: number;

  @ViewChild('reviewForm') public reviewForm: NgForm;

  reviewAddedText: string;

  model = new Review();
  reviewStatus = ReviewStatus;

  constructor(private reviewService: ReviewService, private translate: TranslateService, private messageService: MessageService) { }

  reviewOK() {
    this.reviewService.addReview(this.id, new Review(undefined, undefined, ReviewStatus.OK))
                      .subscribe(
                        v => {
                          this.model = new Review();
                          this.messageService.add(this.reviewAddedText, 'success');
                        },
                        error => {}
                      );
  }

  hasFormError(field) {
    return field !== undefined && field.touched && field.invalid;
  }

  resetForm() {
    this.reviewForm.reset();
  }

  onSubmit() {
    this.reviewService.addReview(this.id, this.model)
                      .subscribe(
                        v => {
                          this.model = new Review();
                          this.messageService.add(this.reviewAddedText, 'success');
                          this.reviewForm.reset();
                        },
                        error => {}
                      );
    return false;
  };

  ngOnChanges(changes: SimpleChanges) {
    this.id = changes['id'].currentValue;
  }

  ngOnInit() {
    this.translate.get('REVIEW ADDED').subscribe((res: string) => {
      this.reviewAddedText = res;
    });
  }
}

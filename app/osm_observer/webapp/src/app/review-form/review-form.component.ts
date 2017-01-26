import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import {TranslateService} from 'ng2-translate';

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

  reviewOKComment: string;
  reviewAddedText: string;

  model = new Review();
  reviewStatus = ReviewStatus;

  constructor(private reviewService: ReviewService, private translate: TranslateService, private messageService: MessageService) { }

  reviewOK() {
    this.reviewService.addReview(this.id, new Review(undefined, undefined, ReviewStatus.OK, this.reviewOKComment))
                      .then(v => {
                        this.model = new Review();
                        this.messageService.add(this.reviewAddedText, 'success');
                      })
                      .catch(error => {});;
  }

  hasFormError(field) {
    return field !== undefined && field.touched && field.invalid;
  }

  resetForm() {
    this.reviewForm.reset();
  }

  onSubmit() {
    this.reviewService.addReview(this.id, this.model)
                      .then(v => {
                        this.model = new Review();
                        this.messageService.add(this.reviewAddedText, 'success');
                        this.reviewForm.reset();
                      })
                      .catch(error => {});
    return false;
  };

  ngOnChanges(changes: SimpleChanges) {
    this.id = changes['id'].currentValue;
  }

  ngOnInit() {
    this.translate.get('OK').subscribe((res: string) => {
      this.reviewOKComment = res;
    });
    this.translate.get('REVIEW ADDED').subscribe((res: string) => {
      this.reviewAddedText = res;
    });
  }
}

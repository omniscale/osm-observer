/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReviewService } from './review.service';

describe('ReviewService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReviewService]
    });
  });

  it('should ...', inject([ReviewService], (service: ReviewService) => {
    expect(service).toBeTruthy();
  }));
});

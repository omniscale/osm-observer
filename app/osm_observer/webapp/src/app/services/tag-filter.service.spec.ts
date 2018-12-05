/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TagFilterService } from './tag-filter.service';

describe('TagFilterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TagFilterService]
    });
  });

  it('should ...', inject([TagFilterService], (service: TagFilterService) => {
    expect(service).toBeTruthy();
  }));
});

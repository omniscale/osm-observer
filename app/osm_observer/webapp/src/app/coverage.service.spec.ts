/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CoverageService } from './coverage.service';

describe('CoverageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoverageService]
    });
  });

  it('should ...', inject([CoverageService], (service: CoverageService) => {
    expect(service).toBeTruthy();
  }));
});

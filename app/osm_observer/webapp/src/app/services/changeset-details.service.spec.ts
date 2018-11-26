/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChangesetDetailsService } from './changeset-details.service';

describe('ChangesetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChangesetDetailsService]
    });
  });

  it('should ...', inject([ChangesetDetailsService], (service: ChangesetDetailsService) => {
    expect(service).toBeTruthy();
  }));
});

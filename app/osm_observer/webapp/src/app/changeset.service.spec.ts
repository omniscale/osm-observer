/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChangesetService } from './changeset.service';

describe('ChangesetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChangesetService]
    });
  });

  it('should ...', inject([ChangesetService], (service: ChangesetService) => {
    expect(service).toBeTruthy();
  }));
});

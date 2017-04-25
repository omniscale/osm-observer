/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChangesetDetailResolver } from './changeset-detail-resolver.service';

describe('ChangesetDetailResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChangesetDetailResolver]
    });
  });

  it('should ...', inject([ChangesetDetailResolver], (service: ChangesetDetailResolver) => {
    expect(service).toBeTruthy();
  }));
});

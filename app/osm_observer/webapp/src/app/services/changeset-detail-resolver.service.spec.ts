/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChangesetDetailResolverService } from './changeset-detail-resolver.service';

describe('ChangesetDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChangesetDetailResolverService]
    });
  });

  it('should ...', inject([ChangesetDetailResolverService], (service: ChangesetDetailResolverService) => {
    expect(service).toBeTruthy();
  }));
});

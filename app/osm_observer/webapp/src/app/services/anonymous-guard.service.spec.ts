/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AnonymousGuardService } from './anonymous-guard.service';

describe('AnonymousGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnonymousGuardService]
    });
  });

  it('should ...', inject([AnonymousGuardService], (service: AnonymousGuardService) => {
    expect(service).toBeTruthy();
  }));
});

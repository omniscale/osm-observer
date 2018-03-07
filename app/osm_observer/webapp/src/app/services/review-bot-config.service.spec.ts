/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReviewBotConfigService } from './review-bot-config.service';

describe('ReviewBotConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReviewBotConfigService]
    });
  });

  it('should ...', inject([ReviewBotConfigService], (service: ReviewBotConfigService) => {
    expect(service).toBeTruthy();
  }));
});

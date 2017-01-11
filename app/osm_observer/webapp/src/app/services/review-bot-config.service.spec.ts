/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReviewBotService } from './review-bot.service';

describe('ReviewBotService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReviewBotService]
    });
  });

  it('should ...', inject([ReviewBotService], (service: ReviewBotService) => {
    expect(service).toBeTruthy();
  }));
});

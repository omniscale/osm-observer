import { Component, OnInit } from '@angular/core';

import {TranslateService} from 'ng2-translate';

import { Coverage } from '../types/coverage';
import { CoverageService } from '../services/coverage.service'
import { MessageService } from '../services/message.service';

@Component({
  selector: 'coverage-list',
  templateUrl: './coverage-list.component.html',
  styleUrls: ['./coverage-list.component.sass']
})
export class CoverageListComponent implements OnInit {

  coverages: Coverage[];

  private changesSavedText: string;
  private changesDiscardedText: string;

  constructor(private coverageService: CoverageService, private messageService: MessageService, private translate: TranslateService) { }

  assignCoverages(coverages: Coverage[]) {
    this.coverages = coverages;
  }

  getCoverages(): void {
    this.coverageService.getCoverages()
                        .then(coverages => this.assignCoverages(coverages))
                        // TODO define onError actions
                        .catch(error => {});
  }

  applyChanges(): void {
    let activeCoverageIds: number[] = [];
    for(let coverage of this.coverages) {
      if(coverage.active) {
        activeCoverageIds.push(coverage.id);
      }
    }
    this.coverageService.setActiveCoverages(activeCoverageIds)
                        .then(v => {
                          this.messageService.add(this.changesSavedText, 'success');
                          this.getCoverages();
                        })
                        // TODO define onError actions
                        .catch(error => {});
  }

  cancelChanges(): void {
    this.getCoverages();
    this.messageService.add(this.changesDiscardedText, 'success');
  }

  ngOnInit() {
    this.translate.get('CHANGES SAVED').subscribe((res: string) => {
      this.changesSavedText = res;
    });
    this.translate.get('CHANGES DISCARDED').subscribe((res: string) => {
      this.changesDiscardedText = res;
    });
    this.getCoverages();
  }

}

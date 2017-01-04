import { Component, OnInit } from '@angular/core';

import { Coverage } from '../coverage';
import { CoverageService } from '../coverage.service'

@Component({
  selector: 'coverage-list',
  templateUrl: './coverage-list.component.html',
  styleUrls: ['./coverage-list.component.css']
})
export class CoverageListComponent implements OnInit {

  coverages: Coverage[];

  constructor(private coverageService: CoverageService) { }

  assignCoverages(coverages: Coverage[]) {
    this.coverages = coverages;
  }

  getCoverages(): void {
    this.coverageService.getCoverages().then(coverages => this.assignCoverages(coverages));
  }

  ngOnInit() {
    this.getCoverages();
  }

}

import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {Subscription } from 'rxjs';

import {TranslateService} from 'ng2-translate';

import { Changeset } from '../types/changeset';
import { Coverage } from '../types/coverage';
import { ChangesetService } from '../services/changeset.service';
import { CoverageService } from '../services/coverage.service';

@Component({
  selector: 'changeset-list',
  templateUrl: './changeset-list.component.html',
  styleUrls: ['./changeset-list.component.sass']
})

export class ChangesetListComponent implements OnInit {

  changesets: Changeset[];
  coverages: Coverage[];

  username: string;
  timeRange: string;
  averageScore: number;
  numReviews: number;
  coverageId: number;

  allowedTimeRanges = ['today', 'yesterday', 'lastWeek']
  allowedCoverageIds: number[];

  private timer;

  private subscription: Subscription;

  constructor(
    private changesetService: ChangesetService,
    private coverageService: CoverageService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    translate: TranslateService
  ) { }

  assignChangesets(changesets: Changeset[]) {
    this.changesets = changesets;
  }

  assignCoverages(coverages: Coverage[]) {
    this.allowedCoverageIds = [];
    this.coverages = coverages;
    for(let c of coverages) {
      this.allowedCoverageIds.push(c.id);
    }
  }

  getChangesets(): void {
    this.changesetService.getChangesets(this.username, this.timeRange, this.averageScore, this.numReviews, this.coverageId)
                         .then(changesets => this.assignChangesets(changesets))
                         // TODO define onError actions
                         .catch(error => {});
  }

  getCoverages(): void {
    this.coverageService.getCoverages()
                        .then(coverages => this.assignCoverages(coverages))
                        // TODO define onError actions
                        .catch(error => {});
  }

  updateRouteParams(): void {
    let routeParams = {};
    if(this.username !== undefined && this.username !== null && this.username !== '') {
      routeParams['username'] = this.username;
    }
    if(this.timeRange !== undefined && this.timeRange !== null && this.timeRange !== '') {
      routeParams['timeRange'] = this.timeRange;
    }
    if(this.averageScore !== undefined && this.averageScore !== null) {
      routeParams['averageScore'] = this.averageScore;
    }
    if(this.numReviews !== undefined && this.numReviews !== null) {
      routeParams['numReviews'] = this.numReviews;
    }
    if(this.coverageId !== undefined && this.coverageId !== null) {
      routeParams['coverageId'] = this.coverageId
    }
    this.router.navigateByUrl(
      this.router.createUrlTree(['/changesets', routeParams])
    );
  }

  handleRouteParams(params: any): void {
    this.username = params['username'] as string;
    this.timeRange = params['timeRange'] as string;
    this.averageScore = parseInt(params['averageScore']) as number;
    if(isNaN(this.averageScore)) {
      this.averageScore = undefined;
    }
    this.numReviews = parseInt(params['numReviews']) as number;
    if(isNaN(this.numReviews)) {
      this.numReviews = undefined;
    }
    this.coverageId = parseInt(params['coverageId']) as number;
    if(isNaN(this.coverageId)) {
      this.coverageId = undefined;
    }

  }

  setTimeRange(timeRange: string): void {
    if(timeRange === this.timeRange) {
      this.timeRange = undefined;
    } else {
      this.timeRange = timeRange;
    }
    this.updateRouteParams();
    this.getChangesets();
  }

  setCoverageId(coverageId: string): void {
    this.coverageId = parseInt(coverageId);
    if(isNaN(this.coverageId)) {
      this.coverageId = undefined;
    }
    this.applyChange();

  }

  applyChange(): void {
    if(this.timer !== undefined) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.updateRouteParams();
      this.getChangesets();
    }, 200);
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(
      (params: any) => this.handleRouteParams(params)
    )
    this.getChangesets();
    this.getCoverages();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs';

import { Changeset } from '../types/changeset';
import { Coverage } from '../types/coverage';
import { ReviewStatus } from '../types/review';
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
  sumScore: number;
  numReviews: number;
  coverageId: number;
  statusId: number;
  currentUserReviewed: boolean;

  allowedTimeRanges = ['today', 'yesterday', 'lastWeek']
  allowedCoverageIds: number[];

  orderBy: string = 'closedAt';
  order: string = 'desc';

  reviewStatus = ReviewStatus;

  loading: boolean = false;

  private timer;

  private subscription: Subscription;

  constructor(
    private changesetService: ChangesetService,
    private coverageService: CoverageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  assignChangesets(changesets: Changeset[]) {
    this.orderBy = 'closedAt';
    this.order = 'desc';
    this.changesets = changesets;
    // when no changesets returned, ng-for onReady is not triggered,
    // so loading is not set to false in that case
    if(this.changesets.length === 0) {
      this.loading = false;
    }
  }

  assignCoverages(coverages: Coverage[]) {
    this.allowedCoverageIds = [];
    this.coverages = coverages;
    for(let c of coverages) {
      this.allowedCoverageIds.push(c.id);
    }
  }

  getChangesets(): void {
    if(this.coverages.length === 0) {
      return;
    }
    this.loading = true;
    this.changesetService.getChangesets(this.username, this.timeRange, this.sumScore, this.numReviews, this.coverageId, this.statusId, this.currentUserReviewed)
                         .subscribe(
                           changesets => this.assignChangesets(changesets),
                           // TODO define onError actions
                           error => {}
                         );
  }

  changesetsRendered(): void {
    setTimeout(() => {
      this.loading = false;
    }, 0);
  }

  getCoverages(): void {
    this.coverageService.getActiveCoverages()
                        .subscribe(
                          coverages => this.assignCoverages(coverages),
                          // TODO define onError actions
                          error => {}
                        );
  }

  updateRouteParams(): void {
    let routeParams = {};
    if(this.username !== undefined && this.username !== null && this.username !== '') {
      routeParams['username'] = this.username;
    }
    if(this.timeRange !== undefined && this.timeRange !== null && this.timeRange !== '') {
      routeParams['timeRange'] = this.timeRange;
    }
    if(this.sumScore !== undefined && this.sumScore !== null) {
      routeParams['score'] = this.sumScore;
    }
    if(this.numReviews !== undefined && this.numReviews !== null) {
      routeParams['numReviews'] = this.numReviews;
    }
    if(this.coverageId !== undefined && this.coverageId !== null) {
      routeParams['coverageId'] = this.coverageId;
    }
    if(this.statusId !== undefined && this.statusId !== null) {
      routeParams['statusId'] = this.statusId;
    }
    if((typeof(this.currentUserReviewed) === "boolean")) {
      routeParams['currentUserReviewed'] = this.currentUserReviewed;
    }
    this.router.navigateByUrl(
      this.router.createUrlTree(['/changesets', routeParams])
    );
  }

  handleRouteParams(params: any): void {
    this.username = params['username'] as string;
    this.timeRange = params['timeRange'] as string;
    this.sumScore = parseInt(params['score']) as number;
    if(isNaN(this.sumScore)) {
      this.sumScore = undefined;
    }
    this.numReviews = parseInt(params['numReviews']) as number;
    if(isNaN(this.numReviews)) {
      this.numReviews = undefined;
    }
    this.coverageId = parseInt(params['coverageId']) as number;
    if(isNaN(this.coverageId)) {
      this.coverageId = undefined;
    }
    this.statusId = parseInt(params['statusId']) as number;
    if(isNaN(this.statusId)) {
      this.statusId = undefined;
    }
    switch(params['currentUserReviewed']) {
      case 'true':
        this.currentUserReviewed = true;
        break;
      case 'false':
        this.currentUserReviewed = false;
        break;
      default:
        this.currentUserReviewed = undefined;
    }
    this.applyChange();
  }

  setTimeRange(timeRange: string): void {
    if(timeRange === this.timeRange) {
      this.timeRange = undefined;
    } else {
      this.timeRange = timeRange;
    }
    this.applyChange();
  }

  setCoverageId(coverageId: string): void {
    this.coverageId = parseInt(coverageId);
    if(isNaN(this.coverageId)) {
      this.coverageId = undefined;
    }
    this.applyChange();

  }

  setStatusId(statusId: string): void {
    this.statusId = parseInt(statusId);
    if(isNaN(this.statusId)) {
      this.statusId = undefined;
    }
    this.applyChange();
  }

  setCurrentUserReviewed(currentUserReviewed: boolean): void {
    if(this.currentUserReviewed === currentUserReviewed) {
      this.currentUserReviewed = undefined;
    } else {
      this.currentUserReviewed = currentUserReviewed;
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

  resetFilters(): void {
    this.username = undefined;
    this.timeRange = undefined;
    this.sumScore = undefined;
    this.numReviews = undefined;
    this.coverageId = undefined;
    this.statusId = undefined;
    this.currentUserReviewed = undefined;
    this.applyChange();
  }

  sortBy(by: string): void {
    if(this.orderBy === by) {
      this.order = this.order === 'desc' ? 'asc' : 'desc';
    } else {
      this.order = 'desc';
    }
    this.orderBy = by;
    this.changesetService.sortChangesets(this.orderBy, this.order);
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(
      (params: any) => this.handleRouteParams(params)
    )
    this.getCoverages();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

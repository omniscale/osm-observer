import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs';

import { Changeset } from '../types/changeset';
import { Coverage } from '../types/coverage';
import { TagFilter } from '../types/tag-filter';
import { ReviewStatus } from '../types/review';
import { ChangesetService } from '../services/changeset.service';
import { CoverageService } from '../services/coverage.service';
import { TagFilterService } from '../services/tag-filter.service';

@Component({
  selector: 'changeset-list',
  templateUrl: './changeset-list.component.html',
  styleUrls: ['./changeset-list.component.sass']
})

export class ChangesetListComponent implements OnInit {

  changesets: Changeset[];
  coverages: Coverage[];
  tagFilters: TagFilter[];

  username: string;
  timeRange: number;
  numReviews: number;
  coverageId: number;
  tagFilterId: number;
  statusId: number;
  currentUserReviewed: boolean;
  allowedCoverageIds: number[];
  allowedTagFilterIds: number[];

  orderBy: string = 'closedAt';
  order: string = 'desc';

  reviewStatus = ReviewStatus;

  loading: boolean = false;

  private timer;

  private subscription: Subscription;

  constructor(
    private changesetService: ChangesetService,
    private coverageService: CoverageService,
    private tagFilterService: TagFilterService,
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

  assignTagFilters(tagFilters: TagFilter[]) {
    this.allowedTagFilterIds = [];
    this.tagFilters = tagFilters;
    for(let c of tagFilters) {
      this.allowedTagFilterIds.push(c.id);
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
    if(this.coverages !== undefined && this.coverages.length === 0) {
      return;
    }
    this.loading = true;
    this.changesetService.getChangesets(
      this.timeRange,
      this.coverageId,
      this.tagFilterId)
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

  getTagFilters(): void {
    this.tagFilterService.getTagFilters()
                        .subscribe(
                          tagFilters => this.assignTagFilters(tagFilters),
                          // TODO define onError actions
                          error => {}
                        );
  }

  updateRouteParams(): void {
    let routeParams = {};
    if(this.username !== undefined && this.username !== null && this.username !== '') {
      routeParams['username'] = this.username;
    }
    if(this.timeRange !== undefined && this.timeRange !== null) {
      routeParams['timeRange'] = this.timeRange;
    }
    if(this.numReviews !== undefined && this.numReviews !== null) {
      routeParams['numReviews'] = this.numReviews;
    }
    if(this.coverageId !== undefined && this.coverageId !== null) {
      routeParams['coverageId'] = this.coverageId;
    }
    if(this.tagFilterId !== undefined && this.tagFilterId !== null) {
      routeParams['tagFilterId'] = this.tagFilterId;
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
    this.timeRange = params['timeRange'] as number;
    this.numReviews = parseInt(params['numReviews']) as number;
    if(isNaN(this.numReviews)) {
      this.numReviews = undefined;
    }
    this.coverageId = parseInt(params['coverageId']) as number;
    if(isNaN(this.coverageId)) {
      this.coverageId = undefined;
    }
    this.tagFilterId = parseInt(params['tagFilterId']) as number;
    if(isNaN(this.tagFilterId)) {
      this.tagFilterId = undefined;
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

  nextTimeRange(rangeStep: string): void {
    if (!this.timeRange) {
      this.timeRange = 0;
    }

    if (rangeStep == 'prev') {
      if (this.timeRange > 0) {
         this.timeRange = +this.timeRange + -1;
      }
    }

    if (rangeStep == 'next') {
      if (this.timeRange >= 0) {
         this.timeRange = +this.timeRange + +1;
      }
    }

    this.applyChange();
  }

  setTimeRange(timeRange: number): void {
    if(timeRange === this.timeRange) {
      this.timeRange = undefined;
    } else {
      this.timeRange = timeRange;
    }
    this.applyChange();
  }

  setTagFilterId(tagFilterId: string): void {
    this.tagFilterId = parseInt(tagFilterId);
    if(isNaN(this.tagFilterId)) {
      this.tagFilterId = undefined;
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
    this.numReviews = undefined;
    this.coverageId = undefined;
    this.tagFilterId = undefined;
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
    this.getTagFilters();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

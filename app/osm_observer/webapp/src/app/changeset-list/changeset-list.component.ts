import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {Subscription } from 'rxjs';

import { Changeset } from '../changeset';
import { ChangesetService } from '../changeset.service';

@Component({
  selector: 'changeset-list',
  templateUrl: './changeset-list.component.html',
  styleUrls: ['./changeset-list.component.sass']
})

export class ChangesetListComponent implements OnInit {

  changesets: Changeset[];
  username: string;
  timeRange: string;
  averageScore: number;
  numReviews: number;

  private timer;

  private subscription: Subscription;

  constructor(
    private changesetService: ChangesetService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  assignChangesets(changesets: Changeset[]) {
    this.changesets = changesets;
  }

  getChangesets(): void {
    this.changesetService.getChangesets()
                         .then(changesets => this.assignChangesets(changesets));
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

    this.router.navigateByUrl(
      this.router.createUrlTree(['/changesets', routeParams])
    );
  }

  handleRouteParams(params: any): void {
    this.username = params['username'] as string;
    this.timeRange = params['timeRange'] as string;
    this.averageScore = params['averageScore'] as number;
    this.numReviews = params['numReviews'] as number;
  }

  setTimeRange(timeRange: string): void {
    if(timeRange === this.timeRange) {
      this.timeRange = undefined;
    } else {
      this.timeRange = timeRange;
    }
    this.updateRouteParams();
  }

  applyChange(): void {
    if(this.timer !== undefined) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.updateRouteParams();
    }, 200);
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(
      (params: any) => this.handleRouteParams(params)
    )
    this.getChangesets();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

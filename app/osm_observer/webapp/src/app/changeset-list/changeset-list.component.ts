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
    if(this.username !== undefined) {
      routeParams['username'] = this.username;
    }
    if(this.timeRange !== undefined) {
      routeParams['timeRange'] = this.timeRange;
    }
    if(this.averageScore !== undefined) {
      routeParams['averageScore'] = this.averageScore;
    }
    if(this.numReviews !== undefined) {
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
    console.log(this.username, this.timeRange, this.averageScore, this.numReviews);
  }

  setTimeRange(timeRange: string): void {
    if(timeRange === this.timeRange) {
      this.timeRange = undefined;
    } else {
      this.timeRange = timeRange;
    }
    this.updateRouteParams();
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

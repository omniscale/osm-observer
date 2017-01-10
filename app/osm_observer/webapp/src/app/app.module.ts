import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';

import { CustomFormsModule } from 'ng2-validation'

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { CoverageListComponent } from './coverage-list/coverage-list.component';
import { CoveragesComponent } from './coverages/coverages.component';
import { CoverageService } from './coverage.service';

import { ChangesetListComponent } from './changeset-list/changeset-list.component';
import { ChangesetService } from './changeset.service';
import { ChangesetDetailsComponent } from './changeset-details/changeset-details.component';

import { ReviewListComponent } from './review-list/review-list.component';
import { ReviewService } from './review.service';
import { ReviewFormComponent } from './review-form/review-form.component';

import { ReviewBotConfigListComponent } from './review-bot-config-list/review-bot-config-list.component';
import { ReviewBotConfigService } from './review-bot-config.service';
import { ReviewBotConfigFormComponent } from './review-bot-config-form/review-bot-config-form.component';


@NgModule({
  declarations: [
    AppComponent,
    CoverageListComponent,
    CoveragesComponent,
    DashboardComponent,
    ChangesetListComponent,
    ChangesetDetailsComponent,
    ReviewListComponent,
    ReviewFormComponent,
    ReviewBotConfigListComponent,
    ReviewBotConfigFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CustomFormsModule,
    RouterModule.forRoot([
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'coverages',
        component: CoveragesComponent
      },
      {
        path: 'changesets',
        component: ChangesetListComponent
      },
      {
        path: 'reviewBotConfigs',
        children: [
          {
            path: '',
            component: ReviewBotConfigListComponent
          },
          {
            path: 'add',
            component: ReviewBotConfigFormComponent
          },
          {
            path: 'edit/:id',
            component: ReviewBotConfigFormComponent
          }
        ]
      }
    ])
  ],
  providers: [
    CoverageService,
    ChangesetService,
    ReviewService,
    ReviewBotConfigService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

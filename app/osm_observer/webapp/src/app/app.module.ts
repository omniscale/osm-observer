import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { RouterModule }   from '@angular/router';

import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate';

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

export function createTranslateLoader(http: Http) {
   return new TranslateStaticLoader(http, '/static/i18n', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CoverageListComponent,
    CoveragesComponent,
    DashboardComponent,
    ChangesetListComponent,
    ChangesetDetailsComponent,
    ReviewListComponent,
    ReviewFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
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
      }
    ])
  ],
  providers: [
    CoverageService,
    ChangesetService,
    ReviewService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }

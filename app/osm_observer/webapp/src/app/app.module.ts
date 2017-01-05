import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { CoverageListComponent } from './coverage-list/coverage-list.component';
import { CoveragesComponent } from './coverages/coverages.component';
import { CoverageService } from './coverage.service';

import { ChangesetListComponent } from './changeset-list/changeset-list.component';
import { ChangesetService } from './changeset.service';

@NgModule({
  declarations: [
    AppComponent,
    CoverageListComponent,
    CoveragesComponent,
    DashboardComponent,
    ChangesetListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
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
    ChangesetService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

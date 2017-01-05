import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';

import { AppComponent } from './app.component';
import { CoverageListComponent } from './coverage-list/coverage-list.component';
import { CoveragesComponent } from './coverages/coverages.component';
import { CoverageService } from './coverage.service';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    CoverageListComponent,
    CoveragesComponent,
    DashboardComponent
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
      }
    ])
  ],
  providers: [CoverageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

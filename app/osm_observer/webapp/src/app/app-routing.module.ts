import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }           from './dashboard/dashboard.component';
import { CoverageListComponent }        from './coverage-list/coverage-list.component';
import { ChangesetListComponent }       from './changeset-list/changeset-list.component';
import { ChangesetDetailsComponent }    from './changeset-details/changeset-details.component';
import { ReviewBotConfigListComponent } from './review-bot-config-list/review-bot-config-list.component';
import { ReviewBotConfigFormComponent } from './review-bot-config-form/review-bot-config-form.component';

const appRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'changesets',
    children: [
      {
        path: '',
        component: ChangesetListComponent
      },
      {
        path: ':id/details',
        component: ChangesetDetailsComponent
      }
    ]
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
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {}

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthService }             from './services/auth.service';
import { AuthGuardService }        from './services/auth-guard.service';
import { ChangesetDetailResolver } from './services/changeset-detail-resolver.service';

import { CoverageListComponent }        from './coverage-list/coverage-list.component';
import { ChangesetListComponent }       from './changeset-list/changeset-list.component';
import { ChangesetDetailsComponent }    from './changeset-details/changeset-details.component';
import { ReviewBotConfigListComponent } from './review-bot-config-list/review-bot-config-list.component';
import { ReviewBotConfigFormComponent } from './review-bot-config-form/review-bot-config-form.component';
import { LoginComponent }               from './login/login.component';

const appRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'changesets',
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        component: ChangesetListComponent
      },
      {
        path: ':id/details',
        component: ChangesetDetailsComponent,
        resolve: {
          changeset: ChangesetDetailResolver
        }
      }
    ]
  },
  {
    path: 'reviewBotConfigs',
    canActivate: [AuthGuardService],
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
  },
  {
    path: '**',
    redirectTo: '/changesets'
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AuthService,
    AuthGuardService,
    ChangesetDetailResolver
  ]
})

export class AppRoutingModule {}

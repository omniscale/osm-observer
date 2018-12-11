import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthService }             from './services/auth.service';
import { AuthGuardService }        from './services/auth-guard.service';
import { AnonymousGuardService}    from './services/anonymous-guard.service';
import { ChangesetDetailResolver } from './services/changeset-detail-resolver.service';

import { TagFilterListComponent }        from './tag-filter-list/tag-filter-list.component';

import { CoverageListComponent }        from './coverage-list/coverage-list.component';
import { ChangesetListComponent }       from './changeset-list/changeset-list.component';
import { ChangesetDetailsComponent }    from './changeset-details/changeset-details.component';
import { LoginComponent }               from './login/login.component';

const appRoutes: Routes = [
  {
    path: 'login',
    canActivate: [AnonymousGuardService],
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
    path: 'filter',
    canActivate: [AuthGuardService],
    component: TagFilterListComponent
  },
  {
    path: 'coverages',
    canActivate: [AuthGuardService],
    component: CoverageListComponent
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
    AnonymousGuardService,
    ChangesetDetailResolver
  ]
})

export class AppRoutingModule {}

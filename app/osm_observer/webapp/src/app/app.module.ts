import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { HttpModule, Http } from '@angular/http';

import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate';
import { CustomFormsModule }                                       from 'ng2-validation'

import { AppComponent }     from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { DashboardComponent }            from './dashboard/dashboard.component';
import { CoverageListComponent }         from './coverage-list/coverage-list.component';
import { CoveragesComponent }            from './coverages/coverages.component';
import { ChangesetListComponent }        from './changeset-list/changeset-list.component';
import { ChangesetDetailsComponent }     from './changeset-details/changeset-details.component';
import { ReviewListComponent }           from './review-list/review-list.component';
import { ReviewFormComponent }           from './review-form/review-form.component';
import { ReviewBotConfigListComponent }  from './review-bot-config-list/review-bot-config-list.component';
import { ReviewBotConfigFormComponent }  from './review-bot-config-form/review-bot-config-form.component';
import { ChangesetCommentListComponent } from './changeset-comment-list/changeset-comment-list.component';
import { ChangesetChangesListComponent } from './changeset-changes-list/changeset-changes-list.component';

import { CoverageService }        from './services/coverage.service';
import { ChangesetService }       from './services/changeset.service';
import { ReviewService }          from './services/review.service';
import { ReviewBotConfigService } from './services/review-bot-config.service';

import { KeyValueListPipe } from './pipes/key-value-list.pipe';


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
    ReviewFormComponent,
    ReviewBotConfigListComponent,
    ReviewBotConfigFormComponent,
    KeyValueListPipe,
    ChangesetCommentListComponent,
    ChangesetChangesListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CustomFormsModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
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

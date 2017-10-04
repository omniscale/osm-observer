import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { Location }         from '@angular/common'

import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate';
import { CustomFormsModule }                                       from 'ng2-validation'
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { PopoverModule } from "ngx-popover";

import { AppComponent }     from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { CoverageListComponent }         from './coverage-list/coverage-list.component';
import { ChangesetListComponent }        from './changeset-list/changeset-list.component';
import { ChangesetDetailsComponent }     from './changeset-details/changeset-details.component';
import { ReviewListComponent }           from './review-list/review-list.component';
import { ReviewFormComponent }           from './review-form/review-form.component';
import { ReviewBotConfigListComponent }  from './review-bot-config-list/review-bot-config-list.component';
import { ReviewBotConfigFormComponent }  from './review-bot-config-form/review-bot-config-form.component';
import { ChangesetCommentListComponent } from './changeset-comment-list/changeset-comment-list.component';
import { ChangesetChangesListComponent } from './changeset-changes-list/changeset-changes-list.component';
import { LoginComponent }                from './login/login.component';
import { MessageViewerComponent }        from './message-viewer/message-viewer.component';
import { JOSMLinkComponent }             from './josmlink/josmlink.component';

import { CoverageService }        from './services/coverage.service';
import { ChangesetService }       from './services/changeset.service';
import { ReviewService }          from './services/review.service';
import { ReviewBotConfigService } from './services/review-bot-config.service';
import { ChangesetDetailResolver } from './services/changeset-detail-resolver.service';
import { MessageService } from './services/message.service';

import { KeyValueListPipe } from './pipes/key-value-list.pipe';
import { HasKeysPipe } from './pipes/has-keys.pipe';
import { ReadyDirective } from './directives/ready.directive';


export function createTranslateLoader(http: Http, location: Location) {
  return new TranslateStaticLoader(http, location.prepareExternalUrl('/static/i18n'), '.json' + '?' + Date.now());
}

@NgModule({
  declarations: [
    AppComponent,
    CoverageListComponent,
    ChangesetListComponent,
    ChangesetDetailsComponent,
    ReviewListComponent,
    ReviewFormComponent,
    ReviewBotConfigListComponent,
    ReviewBotConfigFormComponent,
    KeyValueListPipe,
    HasKeysPipe,
    ChangesetCommentListComponent,
    ChangesetChangesListComponent,
    LoginComponent,
    MessageViewerComponent,
    JOSMLinkComponent,
    ReadyDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CustomFormsModule,
    AppRoutingModule,
    PopoverModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http, Location]
    })
  ],
  providers: [
    CookieService,
    CoverageService,
    ChangesetService,
    ReviewService,
    ReviewBotConfigService,
    ChangesetDetailResolver,
    MessageService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }

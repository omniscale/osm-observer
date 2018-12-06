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

import { TagFilterListComponent }        from './tag-filter-list/tag-filter-list.component';
import { TagFilterFormComponent }           from './tag-filter-form/tag-filter-form.component';

import { CoverageListComponent }         from './coverage-list/coverage-list.component';
import { ChangesetListComponent }        from './changeset-list/changeset-list.component';
import { ChangesetDetailsComponent }     from './changeset-details/changeset-details.component';
import { ChangesetTagsCompareComponent } from './changeset-tags-compare/changeset-tags-compare.component';
import { ChangesetMapComponent }         from './changeset-map/changeset-map.component';
import { ReviewListComponent }           from './review-list/review-list.component';
import { ReviewFormComponent }           from './review-form/review-form.component';
import { ChangesetCommentListComponent } from './changeset-comment-list/changeset-comment-list.component';
import { ChangesetChangesListComponent } from './changeset-changes-list/changeset-changes-list.component';
import { LoginComponent }                from './login/login.component';
import { MessageViewerComponent }        from './message-viewer/message-viewer.component';
import { JOSMLinkComponent }             from './josmlink/josmlink.component';

import { MapService }        from './services/map.service';
import { CoverageService }        from './services/coverage.service';
import { ChangesetService }       from './services/changeset.service';
import { ChangesetDetailsService }       from './services/changeset-details.service';
import { ReviewService }          from './services/review.service';
import { ChangesetDetailResolver } from './services/changeset-detail-resolver.service';
import { MessageService } from './services/message.service';
import { TagFilterService } from './services/tag-filter.service';

import { KeyValueListPipe } from './pipes/key-value-list.pipe';
import { HasKeysPipe } from './pipes/has-keys.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { ReadyDirective } from './directives/ready.directive';

import { OrderModule } from 'ngx-order-pipe';

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
    KeyValueListPipe,
    HasKeysPipe,
    SearchPipe,
    ChangesetCommentListComponent,
    ChangesetChangesListComponent,
    ChangesetTagsCompareComponent,
    ChangesetMapComponent,
    LoginComponent,
    MessageViewerComponent,
    JOSMLinkComponent,
    ReadyDirective,
    TagFilterListComponent,
    TagFilterFormComponent    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CustomFormsModule,
    AppRoutingModule,
    PopoverModule,
    OrderModule,
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
    ChangesetDetailsService,
    ReviewService,
    ChangesetDetailResolver,
    MessageService,
    TagFilterService,
    MapService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }

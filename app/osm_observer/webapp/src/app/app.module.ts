import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { Location }         from '@angular/common'

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { CustomFormsModule }                                       from 'ng2-validation'
import { CookieService } from 'angular2-cookie/services/cookies.service';

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
import { ReviewPipe } from './pipes/reviews.pipe';

import { ReadyDirective } from './directives/ready.directive';

import { OrderModule } from 'ngx-order-pipe';

export function createTranslateLoader(http: HttpClient, location: Location) {
  return new TranslateHttpLoader(http, location.prepareExternalUrl('/static/i18n/'), '.json' + '?' + Date.now());
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
    ReviewPipe,
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
    HttpClientModule,
    CustomFormsModule,
    AppRoutingModule,
    OrderModule,
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient, Location]
        }
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

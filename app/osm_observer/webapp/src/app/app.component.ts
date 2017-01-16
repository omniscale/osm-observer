import { Component } from '@angular/core';

import {TranslateService} from 'ng2-translate';

import { AuthService } from './services/auth.service';
import { AuthResponse } from './types/auth-response';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: []
})
export class AppComponent {
  title = 'OSM Observer';

  constructor(translate: TranslateService, private authService: AuthService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

     // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('de');
  }

  logout() {
    this.authService.logout();
  }
}

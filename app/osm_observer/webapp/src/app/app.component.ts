import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {TranslateService} from 'ng2-translate';

import { AuthService } from './services/auth.service';
import { AuthResponse } from './types/auth-response';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: []
})
export class AppComponent implements OnInit {
  title = 'OSM Observer';

  private loggedOutText: string;

  constructor(public translate: TranslateService, public authService: AuthService, private router: Router, private messageService: MessageService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

     // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('de');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.messageService.add('Logged out', 'success');
  }

  ngOnInit() {
    this.translate.get('LOGGED OUT').subscribe((res: string) => {
      this.loggedOutText = res;
    });

  }
}

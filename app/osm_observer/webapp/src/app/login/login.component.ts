import { Component, OnInit } from '@angular/core';
import { Router }      from '@angular/router';

import { TranslateService } from 'ng2-translate';

import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { User } from '../types/user';

@Component({
  selector: '[login]',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  host: {
    class: 'login-component'
  }
})
export class LoginComponent implements OnInit {

  loginSuccesssfulText: string;
  formInvalidText: string;

  messages: string[] = []

  model: User;

  constructor(public authService: AuthService, public router: Router, private messageService: MessageService, private translate: TranslateService) {
    this.model = new User();
  }

  login(form) {
    if(form.invalid) {
      this.messageService.add(this.formInvalidText, 'error')
      return;
    }
    this.authService.login(this.model)
                    .subscribe(
                      authResponse => {
                        if (authResponse.redirect) {
                          window.location.href = authResponse.url;
                        } else {
                          if(authResponse.success) {
                            let redirect = this.authService.redirectUrl && this.authService.redirectUrl !== '/login' ? this.authService.redirectUrl : '/dashboard';
                            this.router.navigate([redirect]);
                            this.messageService.add(this.messages[authResponse.messageId], 'success');
                          } else {
                            this.messageService.add(this.messages[authResponse.messageId], 'error');
                          }
                        }
                      },
                      // TODO define onError actions
                      error => {}
                    );
    return false;
  }

  hasFormError(field) {
    return field !== undefined && field.touched && field.invalid;
  }

  ngOnInit() {
    this.translate.get('LOGIN SUCCESSFUL').subscribe((res: string) => {
      this.loginSuccesssfulText = res;
    });
    this.translate.get('FILL USERNAME AND PASSWORD').subscribe((res: string) => {
      this.formInvalidText = res;
    });

    // corresponding to views/user.py:MESSAGE_ID
    this.translate.get('ALREADY LOGGED IN').subscribe((res: string) => {
      this.messages[0] = res;
    });
    this.translate.get('LOGGED OUT').subscribe((res: string) => {
      this.messages[1] = res;
    });
    this.translate.get('LOGGED IN').subscribe((res: string) => {
      this.messages[2] = res;
    });
    this.translate.get('LDAP LOGIN FAILED').subscribe((res: string) => {
      this.messages[3] = res;
    });
    this.translate.get('INVALID CREDENTIALS').subscribe((res: string) => {
      this.messages[4] = res;
    });
  }

}

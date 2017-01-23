import { Component, OnInit } from '@angular/core';
import { Router }      from '@angular/router';

import { TranslateService } from 'ng2-translate';

import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { User } from '../types/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  loginSuccesssfulText: string;
  formInvalidText: string;

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
                    .then(authResponse => {
                      if(authResponse.success) {
                        let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/dashboard';
                        this.router.navigate([redirect]);
                        this.messageService.add(this.loginSuccesssfulText, 'success');
                      } else {
                        this.messageService.add(authResponse.message, 'error');
                      }
                    })
                    // TODO define onError actions
                    .catch(e => {});
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
  }

}

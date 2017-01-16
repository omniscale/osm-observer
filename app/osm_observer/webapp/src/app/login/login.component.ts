import { Component} from '@angular/core';
import { Router }      from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../types/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent {

  message: string;

  model: User;

  constructor(public authService: AuthService, public router: Router) {
    this.model = new User();
    this.setMessage();
  }

  setMessage() {
    this.message = 'Logged ' + (this.authService.isLoggedIn() ? 'in' : 'out');
  }

  login() {
    this.message = 'Trying to log in ...';

    this.authService.login(this.model)
                    .then(authResponse => {
                      if(authResponse.success) {
                        let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/dashboard';
                        this.router.navigate([redirect]);
                      } else {
                        this.message = authResponse.message;
                      }
                    })
                    // TODO define onError actions
                    .catch(e => {});
    return false;
  }

  logout() {
    this.authService.logout()
                    .then(authResponse => {
                      this.message = authResponse.message;
                    })
  }

}

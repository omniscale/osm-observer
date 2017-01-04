import { Component } from '@angular/core';

import { Coverage } from './coverage';
import { CoverageService } from './coverage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CoverageService]
})
export class AppComponent {
  title = 'app works!!!!';
}

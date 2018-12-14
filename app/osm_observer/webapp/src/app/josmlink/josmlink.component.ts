import { Component, OnInit, Input, Renderer, ElementRef } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ChangesetService } from '../services/changeset.service';
import { MessageService } from '../services/message.service';
import { Changeset } from '../types/changeset';

@Component({
  selector: 'josmlink',
  templateUrl: './josmlink.component.html',
  styleUrls: ['./josmlink.component.sass']
})
export class JOSMLinkComponent implements OnInit {

  @Input() changeset: Changeset;
  private element: Node;
  private cannotOpenJosmText: string;

  constructor(private changesetService: ChangesetService, private renderer: Renderer, private elementRef: ElementRef, private messageService: MessageService, private translate: TranslateService) {
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.translate.get('CANNOT OPEN JOSM').subscribe((res: string) => {
      this.cannotOpenJosmText = res;
    });
  }

  private buildJSOMUrl(protocol) {
    let url = protocol === 'https:' ?
      'https://127.0.0.1.8112/load_and_zoom?' :
      'http://127.0.0.1:8111/load_and_zoom?';
    let params = [
      'left=' + this.changeset.dataBBOX[0],
      'right=' + this.changeset.dataBBOX[2],
      'top=' + this.changeset.dataBBOX[3],
      'bottom=' + this.changeset.dataBBOX[1]
    ]

    url += params.join('&');
    return url;
  }

  public openJSOM() {
    let loaded = false;
    let url = this.buildJSOMUrl(window.location.protocol);
    let iframe = this.renderer.createElement(this.element, 'iframe');
    this.renderer.setElementAttribute(iframe, 'src', url);
    this.renderer.setElementStyle(iframe, 'display', 'none');
    this.renderer.listen(iframe, 'load', (a, b, c) => {
      this.renderer.detachView([iframe]);
      loaded = true;
    });
    this.renderer.attachViewAfter(this.element, [iframe]);

    // josm iframe should be loaded after a second. If not, show error
    setTimeout(() => {
      if(loaded === false) {
        this.renderer.detachView([iframe]);
        this.messageService.add(this.cannotOpenJosmText, 'error');
      }
    }, 1000);
  }
}

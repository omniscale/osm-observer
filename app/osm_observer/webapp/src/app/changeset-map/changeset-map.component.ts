import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetDetailsService } from '../services/changeset-details.service';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

@Component({
  selector: 'changeset-map',
  templateUrl: './changeset-map.component.html',
  styleUrls: ['./changeset-map.component.sass']
})
export class ChangesetMapComponent implements OnChanges {

  @Input() changeset: ChangesetDetails;

  constructor(private changesetDetailsService: ChangesetDetailsService) { }

  updateMap(changeset: ChangesetDetails) {
    let map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://rvr.demo.omniscale.net/compare/mapproxy/rvr_stadtplan/wmts/rvr_stadtplan/GLOBAL_WEBMERCATOR/{z}/{x}/{y}.png'
            })
          })
        ],
        view: new View({
          projection: 'EPSG:4326',
          center: [10.0154892, 53.60025167530279],
          zoom: 12
        })
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
    this.updateMap(this.changeset);
  }

}

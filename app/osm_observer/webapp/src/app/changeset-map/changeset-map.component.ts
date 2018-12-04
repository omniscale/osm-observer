import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetDetailsService } from '../services/changeset-details.service';

import * as ol from 'openlayers';

@Component({
  selector: 'changeset-map',
  templateUrl: './changeset-map.component.html',
  styleUrls: ['./changeset-map.component.sass']
})
export class ChangesetMapComponent implements OnChanges {

  @Input() changeset: ChangesetDetails;

  constructor(private changesetDetailsService: ChangesetDetailsService) { }

  updateMap(changeset: ChangesetDetails) {
    let extent = changeset.changeset.changesetBBOX;
    let map = new ol.Map({
        target: 'map',
        controls: ol.control.defaults(
          {
            rotate: false,
            attribution: false
          }
        ),
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.transform(
            [extent[0], extent[1]], 'EPSG:4326','EPSG:3857'
          ),
          zoom: 15
        })
    });

    map.getView().fit(
      ol.proj.transformExtent(
        [extent[0], extent[1], extent[2], extent[3]], 'EPSG:4326','EPSG:3857'
      ), {
        size: map.getSize()
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
    this.updateMap(this.changeset);
  }

}

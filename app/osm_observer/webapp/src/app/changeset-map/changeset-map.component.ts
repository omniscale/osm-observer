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

  map: ol.Map;

  constructor(private changesetDetailsService: ChangesetDetailsService) { }

  createNodesLayer() {
    var nodes = [];
    for (let node in this.changeset.changes.nodes) {
       let changeSetnode = this.changeset.changes.nodes[node];
       let key = changeSetnode.key;
       let element = this.changeset.elements['nodes'][key];
       let marker = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat(element.coodinates)
        ),
        });
       nodes.push(marker);
    }

    var styles = [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: 'green'
          })
        })
      })
    ];

    var vectorSource = new ol.source.Vector({
      features: nodes
    });

    var nodesVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styles
    });
    nodesVectorLayer.setZIndex(3);
    return nodesVectorLayer;
  }

  createWaysLayer() {
    var ways = [];
    for (let node in this.changeset.changes.ways) {
       let changesetWay = this.changeset.changes.ways[node];
       let key = changesetWay.key;
       let element = this.changeset.elements['ways'][key];

       var way = [];
       element.nds.forEach((item, index) => {
          let nd = this.changeset.elements['nodes'][item];
          way.push(nd.coodinates)
       });
       var geometry = new ol.geom.LineString(way)
       geometry.transform('EPSG:4326', 'EPSG:3857');
       ways.push(new ol.Feature({
        geometry: geometry 
       }));       
    }

    var vectorSource = new ol.source.Vector({
      features: ways
    });

      var styles = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 3
          })
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 3,
            fill: new ol.style.Fill({
              color: 'red'
            })
          })
        })
      ];

    var waysVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styles
    });
    waysVectorLayer.setZIndex(2);
    return waysVectorLayer;
  }

  createRelationLayer() {
    var relationWays = [];
    var relationPoints = [];
    for (let node in this.changeset.changes.relations) {
       let changesetWay = this.changeset.changes.relations[node];
       let key = changesetWay.key;
       let element = this.changeset.elements['relations'][key];

       var relation = [];
       element.members.forEach((item, index) => {
         if (item["node"]) {
           let element = this.changeset.elements['nodes'][item["node"]];
           let point = new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.fromLonLat(element.coodinates)
            ),
            });
           relationPoints.push(point);
         }

         if (item["way"]) {
           let element = this.changeset.elements['ways'][item["way"]];
           var way = [];
           element.nds.forEach((item, index) => {
              let nd = this.changeset.elements['nodes'][item];
              way.push(nd.coodinates)
           });
           var geometry = new ol.geom.LineString(way)
           geometry.transform('EPSG:4326', 'EPSG:3857');
           
           relationWays.push(new ol.Feature({
              geometry: geometry 
            }));  
         }
       });
    }

    var vectorSource = new ol.source.Vector({
      features: relationPoints.concat(relationWays)
    });

      var styles = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'blue',
            width: 3
          })
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 3,
            fill: new ol.style.Fill({
              color: 'orange'
            })
          })
        })
      ];


    var relationVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styles
    });
    relationVectorLayer.setZIndex(1)
    return relationVectorLayer;
  }
  updateMap(changeset: ChangesetDetails) {
    let extent = changeset.changeset.dataBBOX;
    this.map = new ol.Map({
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

    this.map.getView().fit(
      ol.proj.transformExtent(
        [extent[0], extent[1], extent[2], extent[3]], 'EPSG:4326','EPSG:3857'
      ), {
        size: this.map.getSize()
    });

    let nodesVectorLayer = this.createNodesLayer();
    this.map.addLayer(nodesVectorLayer);

    let waysVectorLayer = this.createWaysLayer();
    this.map.addLayer(waysVectorLayer);

    let relationsVectorLayer = this.createRelationLayer();
    this.map.addLayer(relationsVectorLayer);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
    this.updateMap(this.changeset);
  }

}

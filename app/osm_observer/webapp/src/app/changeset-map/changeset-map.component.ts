import { Component, Input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetDetails } from '../types/changeset-details';
import { MapService } from '../services/map.service';

import * as ol from 'openlayers';

@Component({
  selector: 'changeset-map',
  templateUrl: './changeset-map.component.html',
  styleUrls: ['./changeset-map.component.sass']
})
export class ChangesetMapComponent implements OnChanges {

  @Input() changeset: ChangesetDetails;
  @Input() currentChange: ChangesetChange;
  @Input() currentChangeType: String;

  map: ol.Map;
  nodesVectorLayer: ol.layer.Vector;
  waysVectorLayer: ol.layer.Vector;
  relationsVectorLayer: ol.layer.Vector;

  activeChange: ChangesetChange;
  activeChangeType: string;

  constructor(private mapService: MapService) {}

  styleFunction(feature, resolution) {
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
            color: 'blue'
          })
        })
      })
    ];
  
    var highlightStyle = [
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
    
    var active = feature.get('active');
    if (active) {
      styles = highlightStyle;
    }
    return styles;
  }

  createNodesLayer() {
    var nodes = [];
    for (let node in this.changeset.changes.nodes) {
       let changeSetnode = this.changeset.changes.nodes[node];
       let key = changeSetnode.key;
       let element = this.changeset.elements['nodes'][key];
       let nd = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat(element.coodinates)
        ),
        });
       nd.setProperties({'key': key })
       nodes.push(nd);
    }

    var vectorSource = new ol.source.Vector({
      features: nodes
    });

    var nodesVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: this.styleFunction
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
       var wayFeature = new ol.Feature({ geometry: geometry });
       wayFeature.setProperties({'key': key });
       ways.push(wayFeature);
    }

    var vectorSource = new ol.source.Vector({
      features: ways
    });

    var waysVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: this.styleFunction
    });
    waysVectorLayer.setZIndex(2);
    return waysVectorLayer;
  }

  createRelationLayer() {
    var relationWays = [];
    var relationPoints = [];
    for (let node in this.changeset.changes.relations) {
       let changesetRelation = this.changeset.changes.relations[node];
       let key = changesetRelation.key;
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
           
           let relationFeature = new ol.Feature({
              geometry: geometry 
            })
           relationFeature.setProperties({'key': key });
           relationWays.push(relationFeature);  
         }
       });
    }

    var vectorSource = new ol.source.Vector({
      features: relationPoints.concat(relationWays)
    });

    var relationsVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: this.styleFunction
    });
    relationsVectorLayer.setZIndex(1)
    return relationsVectorLayer;
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

    this.nodesVectorLayer = this.createNodesLayer();
    this.map.addLayer(this.nodesVectorLayer);

    this.waysVectorLayer = this.createWaysLayer();
    this.map.addLayer(this.waysVectorLayer);

    this.relationsVectorLayer = this.createRelationLayer();
    this.map.addLayer(this.relationsVectorLayer);
  }

  zoomToFeature() {
    let key = this.activeChange.key;
    let features = [];
    if (this.activeChangeType == 'nodes') {
      features = this.nodesVectorLayer.getSource().getFeatures();
    }
    if (this.activeChangeType == 'ways') {
      features = this.waysVectorLayer.getSource().getFeatures();
    }
    
    if (this.activeChangeType == 'relations') {
      features = this.relationsVectorLayer.getSource().getFeatures();
    }
    
    for (let feature in features) {
      features[feature].unset('active');
      if (key == features[feature].get('key')) {
        this.map.getView().fit(features[feature].getGeometry().getExtent(), {"maxZoom": 17} );
        features[feature].setProperties({'active': true })
      }
    }
  }

  ngOnInit() {
    this.mapService.change.subscribe(activeChange => {
        this.activeChange = activeChange.change;
        this.activeChangeType = activeChange.type;
        this.zoomToFeature();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
    this.updateMap(this.changeset);
  }
}

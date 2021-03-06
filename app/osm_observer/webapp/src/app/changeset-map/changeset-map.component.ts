import { Component, Input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetDetails } from '../types/changeset-details';
import { MapService } from '../services/map.service';
import { ChangesetElementsNode } from '../types/changeset-elements-node'
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

  hasActiveFeature: boolean = false;
  nextFeatures: boolean = true;
  prevFeatures: boolean = false;

  activeChange: ChangesetChange;
  activeChangeType: string;

  constructor(private mapService: MapService) {
  }

  styleFunction(feature, resolution) {
    let nextStyles = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#cccccc',
        width: 3
      }),
      zIndex: 10
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 3,
        fill: new ol.style.Fill({
          color: '#cccccc'
        })
      }),
      zIndex: 10
    }),
    ];

    let highlightPrevStyle = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'green',
        width: 10
      }),
      zIndex: 15
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({
          color: 'green'
        })
      }),
      zIndex: 15
    })
    ];
    

    let highlightStyle = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#FF0000',
        width: 3
      }),
      zIndex: 20
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 3,
        fill: new ol.style.Fill({
          color: '#FF0000'
        })
      }),
      zIndex: 20
    })
    ];
    
    let prevStyle = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#dcc93d',
        width: 5
      }),
      zIndex: 1
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: '#dcc93d'
        })
      }),
      zIndex: 1
    })
    ];

    let styles = [];
    if (this.nextFeatures) {
      let prev = feature.get('next');
      if (prev) {
        styles = nextStyles;
      }
    }
    if (this.prevFeatures) {
      let prev = feature.get('prev');
      if (prev) {
        styles = prevStyle;
      }
    }

    // hide all other features if app has active feture
    if (this.hasActiveFeature) {
      let active = feature.get('active');
      if (active) {
        if (this.nextFeatures  && feature.get('next')) {
          styles = highlightStyle;
        }
        if (this.prevFeatures && feature.get('prev')) {
          styles = highlightPrevStyle;
        }

      } else {
        styles = []
      }
    }

    return styles;
  }

  // TODO add ChangesetElementsNode
  createNodeFeature(element, key: String, next: boolean, prev: boolean) {
    let coordinates = [element.coordinates[0], element.coordinates[1]];
    let nd = new ol.Feature({
      geometry: new ol.geom.Point(
         ol.proj.fromLonLat(element.coordinates)
        ),
    });
    nd.setProperties({'key': key, 'next': next, 'prev': prev});
    return nd;
  }

  // TODO add ChangesetElementsNode
  createLineFeature(element, key: String, next: boolean, prev: boolean) {
     let way = [];
      element.nds.forEach((item, index) => {
        let nd = this.changeset.elements['nodes'][item];
        way.push(nd.coordinates)
      });

      let wayFeature = new ol.Feature({ 
        geometry: new ol.geom.LineString(way)
        .transform('EPSG:4326', 'EPSG:3857') 
      });

      wayFeature.setProperties({'key': key, 'next': next, 'prev': prev});
      return wayFeature;
  }

  createNodesLayer() {
    let self = this;
    let nodes = [];
    for (let node in this.changeset.changes.nodes) {
      let changeSetnode = this.changeset.changes.nodes[node];
      let key = changeSetnode.key;
      let element = this.changeset.elements['nodes'][key];
      // TODO make better function call
      let point = this.createNodeFeature(element, key, true, false)
      nodes.push(point);

      if (changeSetnode.prevKey) {
        let prevKey = changeSetnode.prevKey;
        let prevElement = this.changeset.elements['nodes'][prevKey];
        let prevPoint = this.createNodeFeature(prevElement, key, false, true)
        nodes.push(prevPoint);
      }
    }

    let vectorSource = new ol.source.Vector({
      features: nodes
    });

    let nodesVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: function(feautre, resolution) {
        return self.styleFunction(feautre, resolution);
      }
    });
    nodesVectorLayer.setZIndex(3);
    return nodesVectorLayer;
  }

  createWaysLayer() {
    let ways = [];
    let self = this;
    for (let node in this.changeset.changes.ways) {
      let changesetWay = this.changeset.changes.ways[node];
      let key = changesetWay.key;
      let element = this.changeset.elements['ways'][key];
      let way = this.createLineFeature(element, key, true, false)
      ways.push(way);

      if (changesetWay.prevKey) {
        let prevKey = changesetWay.prevKey;
        let prevElement = this.changeset.elements['ways'][prevKey];
        let wayPrev = this.createLineFeature(prevElement, prevKey, false, true)
        ways.push(wayPrev);
      }
    }

    let vectorSource = new ol.source.Vector({
      features: ways
    });

    let waysVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: function(feautre, resolution) {
        return self.styleFunction(feautre, resolution);
      }
    });
    waysVectorLayer.setZIndex(2);
    return waysVectorLayer;
  }

  createRelationLayer() {
    let self = this;
    let relationWays = [];
    let relationPoints = [];
    for (let node in this.changeset.changes.relations) {
      let changesetRelation = this.changeset.changes.relations[node];
      let key = changesetRelation.key;
      let element = this.changeset.elements['relations'][key];

      let relation = [];
      element.members.forEach((item, index) => {
        if (item["node"]) {
          let element = this.changeset.elements['nodes'][item["node"]];
          let point = this.createNodeFeature(element, key, true, false)
          relationPoints.push(point);
        }

        if (item["way"]) {
          let element = this.changeset.elements['ways'][item["way"]];
          let way = this.createLineFeature(element, key, true, false)
          relationWays.push(way);  
        }
      });

      if (changesetRelation.prevKey) {
        let prevKey = changesetRelation.key;
        let element = this.changeset.elements['relations'][prevKey];

        let prevRelation = [];
        element.members.forEach((item, index) => {
          if (item["node"]) {
            let prevElement = this.changeset.elements['nodes'][item["node"]];
            let prevPoint = this.createNodeFeature(prevElement, key, false, true)
            relationPoints.push(prevPoint);
          }

          if (item["way"]) {
            let element = this.changeset.elements['ways'][item["way"]];
            let prevWay = this.createLineFeature(element, key, false, true)
            relationWays.push(prevWay);  
          }
        });
      }

    }

    let vectorSource = new ol.source.Vector({
      features: relationPoints.concat(relationWays)
    });

    let relationsVectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: function(feautre, resolution) {
        return self.styleFunction(feautre, resolution);
      }
    });
    relationsVectorLayer.setZIndex(1)
    return relationsVectorLayer;
  }  

  initMap() {
    this.map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults(
      {
        rotate: false,
        attribution: true
      }
      ),
      layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
        // TODO make configurable
        // source: new ol.source.XYZ({
        //   url: "https://rvr.demo.omniscale.net/compare/mapproxy/rvr_stadtplan/wmts/rvr_stadtplan/GLOBAL_WEBMERCATOR/{z}/{x}/{y}.png"
        // })
      })
      ]
    });
  }

  updateMap(changeset: ChangesetDetails) {
    let extent = changeset.changeset.dataBBOX;

    if (this.map === undefined) {
      this.initMap();
    }

    this.map.getView().fit(
      ol.proj.transformExtent(
        [extent[0], extent[1], extent[2], extent[3]], 'EPSG:4326','EPSG:3857'
        ), {
        size: this.map.getSize()
      });

    if (this.nodesVectorLayer) {
      this.map.removeLayer(this.nodesVectorLayer);
    }
    this.nodesVectorLayer = this.createNodesLayer();
    this.map.addLayer(this.nodesVectorLayer);


    if (this.waysVectorLayer) {
      this.map.removeLayer(this.waysVectorLayer);
    }
    this.waysVectorLayer = this.createWaysLayer();
    this.map.addLayer(this.waysVectorLayer);

    if (this.relationsVectorLayer) {
      this.map.removeLayer(this.relationsVectorLayer);
    }
 
    this.relationsVectorLayer = this.createRelationLayer();
    this.map.addLayer(this.relationsVectorLayer);
  }

  showAllFeatures(): void {
    this.hasActiveFeature = false;
    this.refreshVectorLayer();
  }

  activatePrevFeatures(): void {
    this.prevFeatures = true;
    this.nextFeatures = false;
    this.refreshVectorLayer();
  }

  activateNextFeatures(): void {
    this.nextFeatures = true;
    this.prevFeatures = false;
    this.refreshVectorLayer();
  }

  activateAllFeatures(): void {
    this.prevFeatures = true;
    this.nextFeatures = true;
    this.refreshVectorLayer();
  }

  refreshVectorLayer(): void {
    this.relationsVectorLayer.getSource().refresh();
    this.nodesVectorLayer.getSource().refresh();
    this.waysVectorLayer.getSource().refresh();
  }

  zoomToFeature(): void {
    var nodes = this.nodesVectorLayer.getSource().getFeatures();
    var ways = this.waysVectorLayer.getSource().getFeatures();;
    var relations = this.relationsVectorLayer.getSource().getFeatures();;

    let features = nodes.concat(ways).concat(relations);

    let key = this.activeChange.key;
    let prevKey = this.activeChange.prevKey;

    for (let feature in features) {
      // remove old active feature
      if (features[feature].get('active') == true) {
        features[feature].unset('active');
      }
      if (key == features[feature].get('key')) {
        this.map.getView().fit(
          features[feature].getGeometry().getExtent(),
          {"maxZoom": 19}
          );
        features[feature].setProperties({'active': true })
        this.hasActiveFeature = true;
      }
      if (prevKey == features[feature].get('key')) {
        features[feature].setProperties({'active': true })
        this.hasActiveFeature = true;
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
    this.activeChange = undefined;
    this.activeChangeType = undefined;
    this.changeset = changes['changeset'].currentValue;
    this.updateMap(this.changeset);
  }
}

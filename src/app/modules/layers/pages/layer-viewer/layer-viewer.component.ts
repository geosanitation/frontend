import {
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Group, Layer } from "src/app/data/models/type";
import { DataOsmLayersServiceService } from "src/app/data/services/data-som-layers-service.service";
import { StoreService } from "src/app/data/store/store.service";
import { CartoHelper } from "src/app/helper/carto.helper";
import { BaseMaps } from "src/app/modules/shared/pages/basemap-switcher/baseMaps";
import {
  Coordinate,
  Map,
  OSM,
  ScaleLine,
  TileLayer,
  View,
  boundingExtent,
  fromLonLat,
} from "src/app/ol-module";
import { environment } from "src/environments/environment";
@Component({
  selector: "geosanitation-layer-viewer",
  templateUrl: "./layer-viewer.component.html",
  styleUrls: ["./layer-viewer.component.scss"],
})
export class LayerViewerComponent implements OnInit {
  @Input() layer: Layer;
  @Input() group: Group;

  map: Map = new Map({
    controls: [],
    layers: [new BaseMaps().getTopoMaptiler()],
    view: new View({
      center: fromLonLat([47.5, -18.92]),
      zoom: 11,
    }),
  });

  @ViewChild("mapPreviewDiv") set myDiv(myDiv: ElementRef) {
    this.map.setTarget(myDiv.nativeElement);
    this.map.updateSize();

    let scaleControl = new ScaleLine({
      units: "metric",
      // bar: true,
      steps: 2,
      // text: true,
      // minWidth: 100,
    });

    this.map.addControl(scaleControl);
  }

  constructor(
    public dataLayerService: DataOsmLayersServiceService,
    public store: StoreService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["layer"]) {
      if (this.layer) {
        let cartoHelperClass = new CartoHelper(this.map);
        this.layer.providers
          .filter((provider) => provider.vp.state == "good")
          .map((provider) => {
            let url = environment.qgisServerUrl + provider.vp.path_qgis;
            let layerOl = cartoHelperClass.constructLayer({
              nom: this.layer.name,
              type: "wms",
              identifiant: [provider.vp.id_server],
              type_layer: "geosmCatalogue",
              url: url,
              visible: true,
              inToc: true,
              properties: {
                couche_id: this.layer.layer_id,
                type: "couche",
              },
              // iconImagette: environment.backendUrl + pathImg,
              // icon: environment.backendUrl + pathImg,
              cluster: true,
              // size: size,
              legendCapabilities: [],
              styleWMS: [provider.vs.name],
              descriptionSheetCapabilities: "sigfile",
              tocCapabilities: {
                share: true,
                metadata: true,
                opacity: true,
                removable: true,
              },
            });

            cartoHelperClass.addLayerToMap(layerOl);
          });
      }
    }
  }
}

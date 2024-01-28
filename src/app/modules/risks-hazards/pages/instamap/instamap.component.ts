import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import {
  ReplaySubject,
  Subject,
  filter,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { StoreService } from "src/app/data/store/store.service";
import {
  Attribution,
  Map,
  MapBrowserEvent,
  ScaleLine,
  View,
  fromLonLat,
  transformExtent,
  Geolocation,
  Feature,
  Point,
  VectorLayer,
  VectorSource,
} from "../../../../ol-module";
import Geocoder from "ol-geocoder";
import { AddPictureDialogComponent } from "../add-picture-dialog/add-picture-dialog.component";
import { ManagePicturesDialogComponent } from "../manage-pictures-dialog/manage-pictures-dialog.component";
import {
  CartoHelper,
  MGEXTENT,
  dataFromClickOnMapInterface,
} from "src/app/helper/carto.helper";
import { environment } from "src/environments/environment";
import {
  DescriptiveSheetData,
  FeatureInfoDialogComponent,
} from "src/app/modules/shared/pages/feature-info-dialog/feature-info-dialog.component";
import { fromOpenLayerEvent } from "src/app/modules/shared/pages/class/fromOpenLayerEvent";
import { InstamapFeatureDialogComponent } from "../instamap-feature-dialog/instamap-feature-dialog.component";

@Component({
  selector: "geosanitation-instamap",
  templateUrl: "./instamap.component.html",
  styleUrls: ["./instamap.component.scss"],
})
export class InstamapComponent implements OnInit {
  /**
   * Init add pictures layer on the map
   */
  public onInitInstance: () => void;

  /**
   * Emit to open the add picture dialog
   */
  public onAddPictureInstance: () => void;

  /**
   * Emit to open the manage pictures dialog
   */
  public onManagePicturesInstance: () => void;

  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  mainMap = new Map({
    controls: [],
    layers: [],
    view: new View({
      center: fromLonLat([46.4167373545000004,-18.8514324675000005]),
      extent: transformExtent(MGEXTENT, "EPSG:4326", "EPSG:3857"),
      zoom: 6,
    }),
  });

  geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: this.mainMap.getView().getProjection(),
  });

  accuracyFeature = new Feature();
  positionFeature = new Feature();

  @ViewChild("mapDiv") set myDiv(myDiv: ElementRef) {
    this.mainMap.setTarget(myDiv.nativeElement);
    this.mainMap.updateSize();

    let scaleControl = new ScaleLine({
      units: "metric",
      steps: 2,
    });

    let attribution = new Attribution({
      collapsible: true,
    });
    // Instantiate with some options and add the Control
    const geocoder = new Geocoder("nominatim", {
      provider: "osm",
      targetType: "text-input",
      lang: "fr-FR",
      placeholder: "Trouver un lieu par son nom",
      limit: 5,
      keepOpen: false,
      countrycodes: "MG",
      preventMarker: true,
    });

    this.mainMap.addControl(attribution);
    this.mainMap.addControl(geocoder);
    this.mainMap.addControl(scaleControl);

    let layer_name = "public_picture";
    let cartoHelperClass = new CartoHelper(this.mainMap);
    let url = environment.qgisServerUrl + "instamap_project.qgs";
    let layerOl = cartoHelperClass.constructLayer({
      nom: layer_name,
      type: "wms",
      identifiant: [layer_name],
      type_layer: "geosmCatalogue",
      url: url,
      visible: true,
      inToc: true,
      properties: {
        couche_id: layer_name,
        type: "couche",
      },
      cluster: true,
      legendCapabilities: [],
      styleWMS: ["default"],
      descriptionSheetCapabilities: "sigfile",
      tocCapabilities: {
        share: true,
        metadata: true,
        opacity: true,
        removable: true,
      },
    });
    cartoHelperClass.addLayerToMap(layerOl);
  }

  constructor(public nbDialog: NbDialogService, public store: StoreService) {
    const onAddPicture: Subject<void> = new Subject<void>();
    this.onAddPictureInstance = () => {
      onAddPicture.next();
    };

    const onManagePictures: Subject<void> = new Subject<void>();
    this.onManagePicturesInstance = () => {
      onManagePictures.next();
    };

    onAddPicture
      .pipe(
        switchMap(() => {
          return this.nbDialog
            .open(AddPictureDialogComponent, {
              autoFocus: false,
              closeOnBackdropClick: false,
            })
            .onClose.pipe(filter((resultConfirmation) => resultConfirmation));
        })
      )
      .subscribe();

    onManagePictures
      .pipe(
        switchMap(() => {
          return this.nbDialog
            .open(ManagePicturesDialogComponent, {
              autoFocus: false,
            })
            .onClose.pipe(filter((resultConfirmation) => resultConfirmation));
        })
      )
      .subscribe();

    fromOpenLayerEvent<MapBrowserEvent<any>>(this.mainMap, "singleclick")
      .pipe(
        takeUntil(this.destroyed$),
        tap((e) => {
          function compare(a, b) {
            if (a.getZIndex() < b.getZIndex()) {
              return 1;
            }
            if (a.getZIndex() > b.getZIndex()) {
              return -1;
            }
            return 0;
          }
          new CartoHelper(this.mainMap).mapHasCliked(
            e,
            (data: dataFromClickOnMapInterface) => {
              if (data.type == "raster") {
                var layers = data.data.layers.sort(compare);
                var layerTopZindex = layers.length > 0 ? layers[0] : undefined;
                if (layerTopZindex) {
                  let sheetData: DescriptiveSheetData = {
                    type: layerTopZindex.get("descriptionSheetCapabilities"),
                    coordinates_3857: data.data.coord,
                    layer_id: layerTopZindex.get("properties").couche_id,
                    map: this.mainMap,
                    feature: data.data.feature,
                    layer: layerTopZindex,
                  };

                  this.nbDialog.open(InstamapFeatureDialogComponent, {
                    context: {
                      data: sheetData,
                    },
                    autoFocus: false,
                    hasBackdrop: true,
                    backdropClass: "dialog-backdrop-custom",
                  });
                }
              } else if (data.type == "clear") {
              } else if (data.type == "vector") {
                var layers = data.data.layers.sort(compare);
                var layerTopZindex = layers.length > 0 ? layers[0] : undefined;

                if (layerTopZindex) {
                  // var descriptionSheetCapabilities = layerTopZindex.get('descriptionSheetCapabilities')
                  // this.manageCompHelper.openDescriptiveSheet(descriptionSheetCapabilities, cartoHelperClass.constructAlyerInMap(layerTopZindex), data.data.coord, data.data.feature.getGeometry(), data.data.feature.getProperties())
                }
              }
            }
          );
        })
      )
      .subscribe();

    fromOpenLayerEvent<MapBrowserEvent<any>>(
      this.geolocation,
      "change:accuracyGeometry"
    )
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => {
          this.accuracyFeature.setGeometry(
            this.geolocation.getAccuracyGeometry()
          );
          let cartoHelperClass = new CartoHelper(this.mainMap)
          cartoHelperClass.fit_view(this.geolocation.getAccuracyGeometry(), 18)
        })
      )
      .subscribe();

    fromOpenLayerEvent<MapBrowserEvent<any>>(
      this.geolocation,
      "change:position"
    )
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => {
          const coordinates = this.geolocation.getPosition();
          console.log(coordinates)
          this.positionFeature.setGeometry(
            coordinates ? new Point(coordinates) : null
          );
        })
      )
      .subscribe();
  }

  ngOnInit(): void {}

  zoomIn() {
    let currentZoom = this.mainMap.getView().getZoom();
    let options = {
      zoom: currentZoom + 0.5,
      duration: 500,
    };
    this.mainMap.getView().animate(options);
  }

  zoomOut() {
    let currentZoom = this.mainMap.getView().getZoom();
    let options = {
      zoom: currentZoom - 0.5,
      duration: 500,
    };
    this.mainMap.getView().animate(options);
  }

  resetView() {
    let options = {
      center: fromLonLat([47.5, -18.92]),
      zoom: 11.5,
      duration: 1000,
    };
    this.mainMap.getView().animate(options);
  }

  resetRotation() {
    this.mainMap.getView().setRotation(0);
  }

  getMapRotation() {
    let rotation = this.mainMap.getView().getRotation();
    return rotation * 50;
  }

  switchGeolocation() {
    let isEnabled = this.geolocation.getTracking();
    this.geolocation.setTracking(!isEnabled);
    const layerName = "user_location";
    if (this.geolocation.getTracking()) {
      let positionLayer = new VectorLayer({
        source: new VectorSource({
          features: [this.accuracyFeature, this.positionFeature],
        }),
      });
      positionLayer.set("name", layerName);
      positionLayer.setZIndex(0)
      this.mainMap.addLayer(positionLayer);
    } else {
      this.mainMap.getLayers().forEach((layer) => {
        if (layer.get("name") && layer.get("name") == layerName) {
          this.mainMap.removeLayer(layer);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

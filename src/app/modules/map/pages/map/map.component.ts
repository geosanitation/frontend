import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  NbDialogService,
  NbSidebarService
} from "@nebular/theme";
import { MapBrowserEvent } from "ol";
import { fromLonLat, transformExtent } from "ol/proj";
import { ReplaySubject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { StoreService } from "src/app/data/store/store.service";
import { environment } from "../../../../../environments/environment";
import {
  CartoHelper,
  MGEXTENT,
  dataFromClickOnMapInterface,
} from "../../../../helper/carto.helper";
import { Attribution, Map, ScaleLine, View } from "../../../../ol-module";
import { fromOpenLayerEvent } from "../../../shared/pages/class/fromOpenLayerEvent";
import {
  DescriptiveSheetData,
  FeatureInfoDialogComponent,
} from "../../../shared/pages/feature-info-dialog/feature-info-dialog.component";

@Component({
  selector: "geosanitation-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  env = environment;

  mainMap = new Map({
    controls: [],
    layers: [],
    view: new View({
      center: fromLonLat([47.5, -18.92]),
      extent: transformExtent(MGEXTENT, 'EPSG:4326', 'EPSG:3857'),
      zoom: 11.5,
    }),
  });

  @ViewChild("otherModal", { read: TemplateRef, static: true })
  otherModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("sdaModal", { read: TemplateRef, static: true })
  sdaModalTemplate: TemplateRef<HTMLElement>;
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

    this.mainMap.addControl(attribution);
    this.mainMap.addControl(scaleControl);
    this.store.mainMap$.next(this.mainMap);
  }
  constructor(
    public store: StoreService,
    private sidebarService: NbSidebarService,
    public nbDialog: NbDialogService
  ) {
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
                  // this.dialogRef.close()

                  this.nbDialog.open(FeatureInfoDialogComponent, {
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
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  toggleMapSideBar() {
    this.sidebarService.toggle(false, "map-sidebar");
  }

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
}

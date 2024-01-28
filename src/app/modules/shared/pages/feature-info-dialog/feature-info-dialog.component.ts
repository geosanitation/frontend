import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from "@angular/core";
import ImageSource from "ol/source/Image";
import TileSource from "ol/source/Tile";
import {
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  concat,
  delayWhen,
  filter,
  map,
  retryWhen,
  switchMap,
  take,
  tap,
  timer,
  toArray,
} from "rxjs";
import { Group, Layer } from "src/app/data/models/type";
import {
  Coordinate,
  Feature,
  ImageLayer,
  TileLayer,
  VectorLayer,
  Map,
  VectorSource,
  Style,
  CircleStyle,
  Fill,
  Stroke,
  ImageWMS,
  GeoJSON,
} from "src/app/ol-module";
import { environment } from "src/environments/environment";
import { Extent } from "ol/extent";
import { NbDialogRef } from "@nebular/theme";
import { DataOsmLayersServiceService } from "src/app/data/services/data-som-layers-service.service";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { CartoHelper } from "src/app/helper/carto.helper";

export interface DescriptiveSheetData {
  /**
   * type of layer, 'osm' for osm layers
   */
  type: string;
  /**
   * Data osm layer id
   */
  layer_id: number;
  /**
   * Featur user clicked on if exist
   */
  feature?: Feature;
  /**
   * layer user clicked on
   */
  layer:
    | ImageLayer<ImageSource>
    | TileLayer<TileSource>
    | VectorLayer<VectorSource>;
  map: Map;
  /**
   * Coordiante at pixel where the user clicked
   */
  coordinates_3857: Coordinate;
  // getShareUrl?:(environment,ShareServiceService:ShareServiceService)=>string
}

export interface FeatureForSheet extends Feature {
  provider_style_id: number;
  provider_vector_id: number;
  primary_key_field: string;
}

@Component({
  selector: "geosanitation-feature-info-dialog",
  templateUrl: "./feature-info-dialog.component.html",
  styleUrls: ["./feature-info-dialog.component.scss"],
})
export class FeatureInfoDialogComponent implements OnInit {
  @Input() data: DescriptiveSheetData;
  public onInitInstance: () => void;
  /**
   * current dataOsmLAyer
   */
  dataOsmLAyer: {
    group: Group;
    layer: Layer;
  };
  /**
   * VectorLayer of hightlight feature and style
   */
  highlightLayer: VectorLayer<VectorSource> = new VectorLayer({
    source: new VectorSource(),
    style: (feature) => {
      var color = "#f44336";
      return new Style({
        fill: new Fill({
          color: [
            this.hexToRgb(color).r,
            this.hexToRgb(color).g,
            this.hexToRgb(color).b,
            0.5,
          ],
        }),
        stroke: new Stroke({
          color: color,
          width: 6,
        }),
        image: new CircleStyle({
          radius: 11,
          stroke: new Stroke({
            color: color,
            width: 4,
          }),
          fill: new Fill({
            color: [
              this.hexToRgb(color).r,
              this.hexToRgb(color).g,
              this.hexToRgb(color).b,
              0.5,
            ],
          }),
        }),
      });
    },
  });
  /**
   * List of features from WMSGetFeatureInfo at pixel where user clicked
   */
  features$: Observable<FeatureForSheet[]>;

  environment = environment;

  // OsmSheetComponent

  /**
   * extent of the current feature, if the user want to zoom on int
   */
  extent: Extent;

  featureInfoIsLoading: boolean = false;

  constructor(
    public dialogRef: NbDialogRef<FeatureInfoDialogComponent>,
    public dataOsmLayersServiceService: DataOsmLayersServiceService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {
    this.highlightLayer.set("type_layer", "highlightFeature");
    this.highlightLayer.set("nom", "highlightFeature");

    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
    };

    onInit
      .pipe(
        filter(
          () =>
            this.dataOsmLayersServiceService.getLayerInMap(
              this.data.layer_id
            ) == undefined
        ),
        tap(() => {
          this.close(false);
        }),
        take(1)
      )
      .subscribe();

    this.features$ = onInit.pipe(
      filter(
        () =>
          this.dataOsmLayersServiceService.getLayerInMap(this.data.layer_id) !=
          undefined
      ),
      tap(() => {
        this.dataOsmLAyer = this.dataOsmLayersServiceService.getLayerInMap(
          this.data.layer_id
        );
        this.cdRef.detectChanges();
      }),
      map(() => {
        return this.dataOsmLAyer.layer.providers.map((provider) => {
          // let env =
          //   this.data.type == 'osm'
          //     ? environment.url_carto
          //     : environment.backend + '/api/data-provider/vector/sheet?map=';

          // if osm
          // let env = environment.url_carto;
          let url =
            environment.backendUrl +
            "/api/data-provider/vector/sheet?map=" +
            provider.vp.path_qgis;

          return {
            url:
              new ImageWMS({
                url: url,
                params: { LAYERS: provider.vp.id_server, TILED: true },
                serverType: "qgis",
                crossOrigin: "anonymous",
              }).getFeatureInfoUrl(
                this.data.coordinates_3857,
                this.data.map.getView().getResolution(),
                "EPSG:3857",
                {}
              ) +
              "&INFO_FORMAT=application/json&WITH_GEOMETRY=true&FI_POINT_TOLERANCE=30&FI_LINE_TOLERANCE=10&FI_POLYGON_TOLERANCE=10",
            provider_vector_id: provider.vp,
            provider_style: provider.vs,
          };
        });
      }),
      switchMap((parameters) => {
        const headers = new HttpHeaders({ "Content-Type": "text/xml" });
        this.featureInfoIsLoading = true;
        this.cdRef.detectChanges();
        return concat(
          ...parameters.map((param) => {
            return this.http.get(param.url, { responseType: "text" }).pipe(
              catchError(() => {
                this.featureInfoIsLoading = false;
                this.cdRef.detectChanges();
                return EMPTY;
              }),
              map((response) => {
                return new GeoJSON().readFeatures(response).map((feature) => {
                  return Object.assign(feature, {
                    primary_key_field:
                      param.provider_vector_id.primary_key_field,
                    provider_vector_id:
                      param.provider_vector_id.provider_vector_id,
                    provider_style_id: param.provider_style.provider_style_id,
                  });
                });
              })
            );
          })
        ).pipe(
          /** retry 3 times after 2s if querry failed  */
          retryWhen((errors) =>
            errors.pipe(
              tap((val: HttpErrorResponse) => {
                // console.log(val)
              }),
              delayWhen((val: HttpErrorResponse) => timer(2000)),
              // delay(2000),
              take(3)
            )
          ),
          toArray(),
          map((values) => {
            return [].concat.apply([], values);
          }),
          tap((values) => {
            this.featureInfoIsLoading = false;
            this.cdRef.detectChanges();
            if (values.length == 0) {
              this.close(false);
            }
          })
        );
      })
    );
  }

  ngOnInit(): void {
    this.onInitInstance();
    this.initialiseHightLightMap();
    
  }
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  ngOnDestroy() {
    this.highlightLayer.getSource().clear();
    this.destroyed$.complete();
  }

  /**
   * Initialise hightLight layer in the map
   */
  initialiseHightLightMap() {
    var cartoClass = new CartoHelper(this.data.map);
    if (cartoClass.getLayerByName("highlightFeature").length > 0) {
      this.highlightLayer = cartoClass.getLayerByName("highlightFeature")[0];
      this.highlightLayer.setZIndex(1000);
    } else {
      this.highlightLayer.setZIndex(1000);
      cartoClass.map.addLayer(this.highlightLayer);
    }

    if (cartoClass.getLayerByName("highlightFeature").length > 0) {
      cartoClass.getLayerByName("highlightFeature")[0].getSource().clear();
    }
  }
  close(result: boolean) {
    var cartoClass = new CartoHelper(this.data.map);

    if (cartoClass.getLayerByName("highlightFeature").length > 0) {
      cartoClass.getLayerByName("highlightFeature")[0].getSource().clear();
    }

    this.dialogRef.close(result);
  }

  /**
   * Covert a color from hex to rgb
   * @param hex string
   * @return  {r: number, g: number, b: number }
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
}

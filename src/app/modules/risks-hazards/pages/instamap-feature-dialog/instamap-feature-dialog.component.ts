import { DatePipe } from "@angular/common";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import {
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  concat,
  delayWhen,
  map,
  retryWhen,
  switchMap,
  take,
  tap,
  timer,
  toArray,
} from "rxjs";
import { PublicPicture } from "src/app/data/models/risks-hazards";
import { CartoHelper } from "src/app/helper/carto.helper";
import { DescriptiveSheetData } from "src/app/modules/shared/pages/feature-info-dialog/feature-info-dialog.component";
import {
  CircleStyle,
  Feature,
  Fill,
  ImageWMS,
  Stroke,
  Style,
  VectorLayer,
  VectorSource,
  GeoJSON,
} from "src/app/ol-module";
import { environment } from "src/environments/environment";

@Component({
  selector: "geosanitation-instamap-feature-dialog",
  templateUrl: "./instamap-feature-dialog.component.html",
  styleUrls: ["./instamap-feature-dialog.component.scss"],
})
export class InstamapFeatureDialogComponent implements OnInit {
  @Input() data: DescriptiveSheetData;
  public onInitInstance: () => void;
  /**
   * List of features from WMSGetFeatureInfo at pixel where user clicked
   */
  features$: Observable<PublicPicture[]>;

  environment = environment;
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

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  featureInfoIsLoading: boolean = false;

  constructor(
    public dialogRef: NbDialogRef<InstamapFeatureDialogComponent>,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {
    this.highlightLayer.set("type_layer", "highlightFeature");
    this.highlightLayer.set("nom", "highlightFeature");

    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
    };

    this.features$ = onInit.pipe(
      map(() => {
        let url = environment.qgisServerUrl + "instamap_project.qgs";
        return (
          new ImageWMS({
            url: url,
            params: { LAYERS: this.data.layer_id, TILED: true },
            serverType: "qgis",
            crossOrigin: "anonymous",
          }).getFeatureInfoUrl(
            this.data.coordinates_3857,
            this.data.map.getView().getResolution(),
            "EPSG:3857",
            {}
          ) +
          "&INFO_FORMAT=application/json&WITH_GEOMETRY=true&FI_POINT_TOLERANCE=30&FI_LINE_TOLERANCE=10&FI_POLYGON_TOLERANCE=10"
        );
      }),
      switchMap((url) => {
        this.featureInfoIsLoading = true;
        this.cdRef.detectChanges();
        return this.http
          .get(url, { responseType: "text" })
          .pipe(
            catchError(() => {
              this.featureInfoIsLoading = false;
              this.cdRef.detectChanges();
              return EMPTY;
            }),
            map((response) => {

              let geojsonFeatures = new GeoJSON().readFeatures(response)
              this.highlightLayer.getSource().clear();
              setTimeout(() => {
                this.highlightLayer.getSource().addFeature(geojsonFeatures[0]);
              }, 500);
              let features: GeoJSONFeature[] = JSON.parse(response).features
              let result = features.map((feature) => {
                return feature.properties as PublicPicture
              })
              return result
            })
          )
          .pipe(
            /** retry 3 times after 2s if querry failed  */
            retryWhen((errors) =>
              errors.pipe(
                tap((val: HttpErrorResponse) => {
                }),
                delayWhen((val: HttpErrorResponse) => timer(2000)),
                // delay(2000),
                take(3)
              )
            ),
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


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = this.datePipe.transform(date, "dd/MM/yyyy à HH:mm");
    return formattedDate;
  }

  ngOnDestroy() {
    this.highlightLayer.getSource().clear();
    this.destroyed$.complete();
  }
}

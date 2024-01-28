import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  NbDialogRef,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from "@nebular/theme";
import {
  EMPTY,
  ReplaySubject,
  Subject,
  catchError,
  filter,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { AddOrganizationDialogComponent } from "src/app/modules/actors/pages/add-organization-dialog/add-organization-dialog.component";

import {
  Attribution,
  Feature,
  Icon,
  Map,
  Point,
  ScaleLine,
  Style,
  View,
  fromLonLat,
  VectorSource,
  VectorLayer,
  MapBrowserEvent,
  Coordinate,
  Geolocation,
} from "../../../../ol-module";
import { BaseMaps } from "src/app/modules/shared/pages/basemap-switcher/baseMaps";
import { fromOpenLayerEvent } from "src/app/modules/shared/pages/class/fromOpenLayerEvent";
import WKT from "ol/format/WKT";
import { RisksHazardsService } from "src/app/data/services/risks-hazards.service";
import { HttpErrorResponse } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { PublicPicture } from "src/app/data/models/risks-hazards";
import { DatePipe } from "@angular/common";
import { toLonLat, transformExtent } from "ol/proj";
import { CartoHelper, MGEXTENT } from "src/app/helper/carto.helper";
import Geocoder from "ol-geocoder";

@Component({
  selector: "geosanitation-add-picture-dialog",
  templateUrl: "./add-picture-dialog.component.html",
  styleUrls: ["./add-picture-dialog.component.scss"],
})
export class AddPictureDialogComponent implements OnInit {
  form: FormGroup = this.fb.group({});
  showWarning: boolean = true;

  /**
   * Post a picture
   */
  public onAddInstance: () => void;
  positions = NbGlobalPhysicalPosition;
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: [
        new Feature({
          geometry: new Point(fromLonLat([0, 0])),
        }),
      ],
    }),
  });

  pictureUploadMap = new Map({
    controls: [],
    layers: [this.vectorLayer],
    view: new View({
      center: fromLonLat([47.5, -18.92]),
      extent: transformExtent(MGEXTENT, "EPSG:4326", "EPSG:3857"),
      zoom: 11.5,
    }),
  });

  geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: this.pictureUploadMap.getView().getProjection(),
  });

  accuracyFeature = new Feature();
  positionFeature = new Feature();

  // Instantiate with some options and add the Control
  geocoder = new Geocoder("nominatim", {
    provider: "osm",
    targetType: "text-input",
    lang: "fr-FR",
    placeholder: "Trouver un lieu par son nom",
    limit: 5,
    keepOpen: false,
    countrycodes: "MG",
    preventMarker: true,
  });

  @ViewChild("pictureUpdloadMapDiv") set myDiv(myDiv: ElementRef) {
    this.pictureUploadMap.setTarget(myDiv.nativeElement);
    this.pictureUploadMap.updateSize();

    let scaleControl = new ScaleLine({
      units: "metric",
      steps: 2,
    });

    let attribution = new Attribution({
      collapsible: true,
    });

    // Create a style for the icon
    const iconStyle = new Style({
      image: new Icon({
        scale: 2.5,
        anchor: [0.5, 0.95], // Center the icon on its origin
        src: "/assets/images/location-pin.svg", // Provide the path to your icon image
      }),
    });

    // Apply the style to the vector layer
    this.vectorLayer.setStyle(iconStyle);

    let baseMap = new BaseMaps().getOsmBasemap();

    this.pictureUploadMap.addLayer(baseMap);
    this.pictureUploadMap.addControl(attribution);
    this.pictureUploadMap.addControl(this.geocoder);
    this.vectorLayer.setZIndex(1);
  }

  constructor(
    private fb: FormBuilder,
    protected ref: NbDialogRef<AddOrganizationDialogComponent>,
    public risksHazardsService: RisksHazardsService,
    public translate: TranslateService,
    private toastrService: NbToastrService,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      image: [null, { validators: Validators.required }],
      description: [null, { validators: Validators.required }],
      geom: [null, { validators: Validators.required }],
      taken_at: [null, { validators: Validators.required }],
      uploader_name: [null, { validators: Validators.required }],
      uploader_email: [
        null,
        {
          validators: Validators.compose([
            Validators.required,
            Validators.email,
          ]),
        },
      ],
    });

    fromOpenLayerEvent<MapBrowserEvent<any>>(
      this.pictureUploadMap,
      "singleclick"
    )
      .pipe(
        takeUntil(this.destroyed$),
        tap((e) => {
          let coordinate = e.coordinate;
          this.setLocationCoordinates(coordinate);
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
          let cartoHelperClass = new CartoHelper(this.pictureUploadMap);
          cartoHelperClass.fit_view(this.geolocation.getAccuracyGeometry(), 18);
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
          this.positionFeature.setGeometry(
            coordinates ? new Point(coordinates) : null
          );
        })
      )
      .subscribe();

    fromOpenLayerEvent<MapBrowserEvent<any>>(this.geocoder, "addresschosen")
      .pipe(
        takeUntil(this.destroyed$),
        tap((evt) => {
          const coord = evt.coordinate;
          this.setLocationCoordinates(coord);
        })
      )
      .subscribe();

    const onAdd: Subject<void> = new Subject<void>();
    this.onAddInstance = () => {
      onAdd.next();
    };

    onAdd
      .pipe(
        takeUntil(this.destroyed$),
        filter(() => this.form.valid),
        tap(() => {
          this.form.disable();
        }),
        switchMap(() => {
          let data: PublicPicture = this.form.value;
          data.image = this.form.get("image").value[0];
          data.taken_at = this.formatDate(this.form.get("taken_at").value);
          return this.risksHazardsService
            .addPublicPicture(toFormData(data))
            .pipe(
              catchError((error: HttpErrorResponse) => {
                this.form.enable();
                this.toastrService.danger(
                  error.error?.image
                    ? error.error.image[0]
                    : this.translate.instant(
                        "risks_hazards.instamap.error_posting_picture"
                      ),
                  this.translate.instant("error"),
                  { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                );
                return EMPTY;
              }),
              tap((picture) => {
                this.toastrService.success(
                  this.translate.instant(
                    "risks_hazards.instamap.request_success"
                  ),
                  this.translate.instant("success"),
                  { position: this.positions.BOTTOM_LEFT, duration: 10000 }
                );
                this.ref.close(picture);
              })
            );
        })
      )
      .subscribe();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  close(result: boolean) {
    this.ref.close(result);
  }

  coordinateToWKT(coordinate: Coordinate): string {
    const wktFormat = new WKT();
    const point = new Point(coordinate);
    return wktFormat.writeGeometry(point);
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, "yyyy-MM-ddTHH:mm:ss.SSSZ") || "";
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
      positionLayer.setZIndex(0);
      this.pictureUploadMap.addLayer(positionLayer);
    } else {
      this.pictureUploadMap.getLayers().forEach((layer) => {
        if (layer.get("name") && layer.get("name") == layerName) {
          this.pictureUploadMap.removeLayer(layer);
        }
      });
    }
  }

  setLocationCoordinates(coordinate: any[]) {
    this.vectorLayer
      .getSource()
      .getFeatures()[0]
      .getGeometry()
      .setCoordinates(coordinate);

    let lonLat = toLonLat(coordinate);
    let wktString = this.coordinateToWKT(lonLat);
    this.form.get("geom").setValue(wktString);
  }
}

export function toFormData<T>(formValue: T) {
  const formData = new FormData();

  for (const key of Object.keys(formValue)) {
    const value = formValue[key];
    if (value) {
      formData.append(key, value);
    }
  }

  return formData;
}

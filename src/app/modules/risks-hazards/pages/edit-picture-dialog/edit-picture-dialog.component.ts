import { DatePipe } from "@angular/common";
import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NbDialogRef, NbGlobalPhysicalPosition, NbToastrService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { PublicPicture } from "src/app/data/models/risks-hazards";
import { RisksHazardsService } from "src/app/data/services/risks-hazards.service";
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
  transformExtent,
} from "../../../../ol-module";
import { BaseMaps } from "src/app/modules/shared/pages/basemap-switcher/baseMaps";
import { EMPTY, ReplaySubject, Subject, catchError, switchMap, takeUntil, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { MGEXTENT } from "src/app/helper/carto.helper";
import { environment } from "src/environments/environment";

@Component({
  selector: "geosanitation-edit-picture-dialog",
  templateUrl: "./edit-picture-dialog.component.html",
  styleUrls: ["./edit-picture-dialog.component.scss"],
  providers: [DatePipe],
})
export class EditPictureDialogComponent implements OnInit {
  @Input() publicPicture: PublicPicture;
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  isLoading: boolean = false;

  environment = environment;
  
  /**
   * Approve a picture
   */
  public onReviewInstance: (is_approved: boolean) => void;
  positions = NbGlobalPhysicalPosition;

  vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: [],
    }),
  });

  pictureUploadMap = new Map({
    controls: [],
    layers: [this.vectorLayer],
    view: new View({
      center: fromLonLat([47.5, -18.92]),
      extent: transformExtent(MGEXTENT, 'EPSG:4326', 'EPSG:3857'),
      zoom: 11.5,
    }),
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
    this.vectorLayer.setZIndex(1);
  }

  constructor(
    protected ref: NbDialogRef<AddOrganizationDialogComponent>,
    public risksHazardsService: RisksHazardsService,
    public translate: TranslateService,
    private toastrService: NbToastrService,
    private datePipe: DatePipe
  ) {
    const onReview: Subject<boolean> = new Subject<boolean>();
    this.onReviewInstance = (is_approved: boolean) => {
      onReview.next(is_approved);
    };
    onReview.pipe(
      takeUntil(this.destroyed$),
      tap(() => this.isLoading = true),
      switchMap((is_approved) => {
        this.publicPicture.is_approved = is_approved
        return this.risksHazardsService.reviewPublicPicture(this.publicPicture).pipe(
          catchError((error: HttpErrorResponse) => {
            this.toastrService.danger(
              error.error?.msg
              ? error.error.msg
              : this.translate.instant("risks_hazards.instamap.error_posting_picture"),
              this.translate.instant("error"),
              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
            );
            this.isLoading = false
            return EMPTY;
          }),
          tap((picture) => {
            this.isLoading = false
            this.ref.close(picture);
          })
        )
      })

    ).subscribe()
  }

  ngOnInit(): void {}

  close(result: boolean) {
    this.ref.close(result);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = this.datePipe.transform(date, "dd/MM/yyyy à HH:mm");
    return formattedDate;
  }

  ngAfterViewInit(): void {
    if (this.publicPicture) {
      var coordinateRegex = /POINT \(([-\d.]+) ([-\d.]+)\)/;
      var match = this.publicPicture.geom.match(coordinateRegex);
      if (match) {
        // Extracted coordinates
        var longitude = parseFloat(match[1]);
        var latitude = parseFloat(match[2]);
        var point = new Feature({
          geometry: new Point(fromLonLat([longitude, latitude])),
        });

        this.vectorLayer.getSource().addFeature(point);
        this.pictureUploadMap
          .getView()
          .fit(this.vectorLayer.getSource().getExtent(), { maxZoom: 16 });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

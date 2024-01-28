import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import {
  NbDialogRef,
  NbDialogService,
  NbMenuItem,
  NbMenuService,
} from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { NotifierService } from "angular-notifier";
import {
  ReplaySubject,
  Observable,
  catchError,
  EMPTY,
  filter,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from "rxjs";
import { Layer } from "src/app/data/models/type";
import { FieldService } from "src/app/data/services/field.service";
import { MapsService } from "src/app/data/services/maps.service";
import { OsmQuerryService } from "src/app/data/services/osm-querry.service";
import { SigFileService } from "src/app/data/services/sig-file.service";
import { VectorProviderService } from "src/app/data/services/vector-provider.service";
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from "src/app/modules/shared/pages/confirmation-dialog/confirmation-dialog.component";
import { environment } from "src/environments/environment";
import { AddIconDialogComponent } from "../add-icon-dialog/add-icon-dialog.component";
import { LayerDetailsComponent } from "../layer-details/layer-details.component";

@Component({
  selector: "geosanitation-layer-edit",
  templateUrl: "./layer-edit.component.html",
  styleUrls: ["./layer-edit.component.scss"],
})
export class LayerEditComponent implements OnInit {
  onInitInstance: () => void;

  /**
   * Add icon to layer
   */
  onAddIconInstance: () => void;
  @Input() layer: Layer;

  /**
   * Update layer
   */

  public onUpdateInstance: () => void;

  /**
   * Delete layer
   */
  public onDeleteInstance: () => void;

  form: FormGroup;
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  activeForm: boolean = true;

  env = environment;
  private readonly notifier: NotifierService;

  connections$: Observable<Array<string>>;

  isLoadingDownload: boolean = false;

  downloadFormats: NbMenuItem[] = [
    { title: "Shapefile", data: "shp" },
    { title: "GeoJSON", data: "geojson" },
    { title: "Geopackage", data: "gpkg" },
    { title: "KML", data: "kml" },
    { title: "CSV", data: "csv" },
  ];

  constructor(
    private _sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public nbDialog: NbDialogService,
    public fieldService: FieldService,
    public mapsService: MapsService,
    public sigFileService: SigFileService,
    public osmQuerryService: OsmQuerryService,
    public translate: TranslateService,
    public notifierService: NotifierService,
    public vectorProviderService: VectorProviderService,
    public dialogRef: NbDialogRef<LayerDetailsComponent>,
    private nbMenuService: NbMenuService
  ) {
    this.notifier = notifierService;

    const onAddIcon: Subject<void> = new Subject<void>();
    this.onAddIconInstance = () => {
      onAddIcon.next();
    };

    onAddIcon
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(() => {
          return this.dialog
            .open(AddIconDialogComponent, { data: this.layer.group })
            .afterClosed()
            .pipe(
              filter((value) => value),
              tap((value: Layer) => {
                this.form.get("icon_color").setValue(value.icon_color);
                this.form.get("color").setValue(value.color);
                this.form
                  .get("icon_background")
                  .setValue(value.icon_background);
                this.form.get("icon").setValue(value.icon);
                this.form.get("svg_as_text").setValue(value.svg_as_text);
                this.form
                  .get("svg_as_text_square")
                  .setValue(value.svg_as_text_square);
                this.form.get("icon_path").setValue(value.icon_path);

                if (value.icon_background) {
                  this.form.get("color").setValue(value.color);
                  this.form.get("color").addValidators([Validators.required]);
                  this.form
                    .get("color")
                    .updateValueAndValidity({ emitEvent: false });
                } else {
                  this.form.get("color").setValue("#000");
                  this.form.get("color").removeValidators(Validators.required);
                  this.form
                    .get("color")
                    .updateValueAndValidity({ emitEvent: false });
                }
              })
            );
        })
      )
      .subscribe();

    const onUpdate: Subject<void> = new Subject<void>();
    this.onUpdateInstance = () => {
      onUpdate.next();
    };

    const onDelete: Subject<void> = new Subject<void>();
    this.onDeleteInstance = () => {
      onDelete.next();
    };

    const onInit: ReplaySubject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
      onInit.complete();
    };

    this.connections$ = onInit.pipe(
      switchMap(() => {
        return this.osmQuerryService.listConnections().pipe(
          catchError((value: HttpErrorResponse) => {
            this.notifierService.notify(
              "error",
              this.translate.instant("groups.layers.error_loading_connections")
            );
            return EMPTY;
          })
        );
      })
    );

    onUpdate
      .pipe(
        takeUntil(this.destroyed$),
        filter(() => this.form.valid),
        tap(() => {
          this.form.disable();
        }),
        switchMap(() => {
          let layer = this.form.value;
          layer.providers = [this.layer.providers[0]];
          if (this.form.get("type_source").value == "query") {
            if (
              this.form.get("sql").value &&
              this.form.get("connection").value
            ) {
              layer.sql = this.form.get("sql").value;
              layer.connection = this.form.get("connection").value;
            }
          } else {
            if (this.form.get("source").value) {
              layer.file = this.form.get("source").value[0];
            }
          }

          return this.mapsService
            .updateLayer(toFormData(layer), layer.layer_id)
            .pipe(
              catchError((error: HttpErrorResponse) => {
                this.form.enable();
                this.notifier.notify(
                  "error",
                  error.error?.msg
                    ? error.error.msg
                    : this.translate.instant(
                        "groups.layers.error_editing_layer"
                      )
                );
                return EMPTY;
              }),
              tap((layer) => {
                this.dialogRef.close(layer);
              })
            );
        })
      )
      .subscribe();

    onDelete
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(() => {
          let data: ConfirmationDialogData = {
            confirmationTitle: this.translate.instant(
              "groups.layers.delete.confirmation_title",
              this.layer
            ),
            confirmationExplanation: this.translate.instant(
              "groups.layers.delete.confirmation_explanation",
              this.layer
            ),
            cancelText: this.translate.instant("no"),
            confirmText: this.translate.instant("yes"),
            danger: true,
          };
          return this.nbDialog
            .open(ConfirmationDialogComponent, {
              context: {
                data: data,
              },
            })
            .onClose.pipe(
              filter((value) => value),
              switchMap(() => {
                return this.mapsService.deleteLayer(this.layer.layer_id).pipe(
                  catchError((error: HttpErrorResponse) => {
                    if (error.status == 500) {
                      // get message error from backend
                      this.notifier.notify(
                        "error",
                        this.translate.instant(
                          "groups.layers.delete.error_deleting_layer_base"
                        )
                      );
                    } else {
                      this.notifier.notify(
                        "error",
                        error.error?.msg
                          ? error.error.msg
                          : this.translate.instant(
                              "groups.layers.delete.error_deleting_layer"
                            )
                      );
                    }

                    return EMPTY;
                  }),
                  tap((response) => {
                    this.dialogRef.close(true);
                  })
                );
              })
            );
        })
      )
      .subscribe();

    this.nbMenuService
      .onItemClick()
      .pipe(
        takeUntil(this.destroyed$),
        filter(({ tag }) => tag === "download-layer-menu"),
        switchMap(({ item: { data } }) => {
          this.isLoadingDownload = true;

          let provider = this.layer.providers[0].vp;

          let querry =
            "map=" +
            provider.path_qgis +
            "&SERVICE=WFS&VERSION=1.3.0&REQUEST=GetFeature&OUTPUTFORMAT=" +
            data +
            "&TYPENAME=" +
            provider.id_server;

          // return this.http.get(querry, { responseType: 'blob' }).pipe(
          return this.fieldService.downloadFeatures(querry).pipe(
            take(1),
            catchError((error: HttpErrorResponse) => {
              this.isLoadingDownload = false;
              this.notifier.notify(
                "error",
                error.error?.msg
                  ? error.error.msg
                  : this.translate.instant(
                      "map.attribute_tables.error_download_features"
                    )
              );
              return EMPTY;
            }),
            tap((response) => {
              // It is necessary to create a new blob object with mime-type explicitly set
              // otherwise only Chrome works like it should
              var newBlob = new Blob([response]);

              // For other browsers:
              // Create a link pointing to the ObjectURL containing the blob.
              const downloadData = window.URL.createObjectURL(newBlob);

              var link = document.createElement("a");
              link.href = downloadData;
              let extension = data;
              if (extension == "shp") {
                extension = "zip";
              }
              link.download = provider.id_server + "." + extension;
              // this is necessary as link.click() does not work on the latest firefox
              link.dispatchEvent(
                new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                })
              );

              setTimeout(function () {
                // For Firefox it is necessary to delay revoking the ObjectURL
                window.URL.revokeObjectURL(downloadData);
                link.remove();
              }, 100);
              this.isLoadingDownload = false;
            })
          );
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.onInitInstance();
  }

  transform(v: any): any {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["layer"] && this.layer) {
      this.form = this.formBuilder.group({
        name: [this.layer.name, [Validators.required]],
        layer_id: [this.layer.layer_id, [Validators.required]],
        protocol_carto: ["wms", [Validators.required]],
        icon_color: [this.layer.icon_color, [Validators.required]],
        color: [this.layer.color, [Validators.required]],
        icon_background: [this.layer.icon_background],
        icon: [this.layer.icon, [Validators.required]],
        svg_as_text: [null],
        svg_as_text_square: [null],
        icon_path: [this.layer.cercle_icon],
        group: [this.layer.group, [Validators.required]],
        type_source: [this.layer.providers[0].vp.source],
        sql: [undefined],
        source: [undefined],
        connection: [undefined],
      });
    }
  }
}

export function toFormData<T>(formValue: T) {
  const formData = new FormData();
  for (const key of Object.keys(formValue)) {
    const value = formValue[key];
    if (value) {
      if (key == "providers") {
        formData.append("providers", JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  }
  return formData;
}

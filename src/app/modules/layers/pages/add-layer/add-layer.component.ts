import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import {
  NbDialogRef,
  NbDialogService,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { EMPTY, Observable, ReplaySubject, Subject } from "rxjs";
import { catchError, filter, switchMap, takeUntil, tap } from "rxjs/operators";
import { environment } from "../../../../../environments/environment";
import { Group, Layer, VectorProvider } from "../../../../data/models/type";
import { MapsService } from "../../../../data/services/maps.service";
import { OsmQuerryService } from "../../../../data/services/osm-querry.service";
import { SigFileService } from "../../../../data/services/sig-file.service";
import { VectorProviderService } from "../../../../data/services/vector-provider.service";
import { AddIconDialogComponent } from "../add-icon-dialog/add-icon-dialog.component";

@Component({
  selector: "geosanitation-add-layer",
  templateUrl: "./add-layer.component.html",
  styleUrls: ["./add-layer.component.scss"],
})
export class AddLayerComponent implements OnInit {
  @Input() group: Group;

  onInitInstance: () => void;
  /**
   * Add icon to layer
   */
  onAddIconInstance: () => void;
  /**
   * Add layer to group
   */
  public onAddInstance: () => void;
  positions = NbGlobalPhysicalPosition;

  form: FormGroup;
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  activeForm: boolean = true;

  env = environment;
  layerIcon: Layer;

  connections$: Observable<Array<string>>;

  constructor(
    private formBuilder: FormBuilder,
    public translate: TranslateService,
    public dialog: NbDialogService,
    public mapsService: MapsService,
    public vectorProviderService: VectorProviderService,
    public sigFileService: SigFileService,
    public osmQuerryService: OsmQuerryService,
    private _sanitizer: DomSanitizer,
    protected dialogRef: NbDialogRef<AddLayerComponent>,
    private toastrService: NbToastrService
  ) {
    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      type_source: ["file_sig", Validators.required],
      sql: [undefined],
      source: [undefined],
      connection: [undefined],
    });
    this.form.addValidators(this.customValidationFunction);

    const onInit: ReplaySubject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
      onInit.complete();
    };

    this.connections$ = onInit.pipe(
      switchMap(() => {
        return this.osmQuerryService.listConnections().pipe(
          catchError((value: HttpErrorResponse) => {
            this.toastrService.danger(
              this.translate.instant("groups.layers.error_loading_connections"),
              this.translate.instant("error"),
              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
            );
            return EMPTY;
          })
        );
      })
    );
    const onAddIcon: Subject<void> = new Subject<void>();
    this.onAddIconInstance = () => {
      onAddIcon.next();
    };
    onAddIcon
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(() => {
          return this.dialog
            .open(AddIconDialogComponent, {
              context: { group: this.group.group_id },
            })
            .onClose.pipe(
              filter((value) => value),
              tap((value) => {
                this.layerIcon = value;
              })
            );
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
          let vectorProvider: VectorProvider = {
            name: this.form.get("name").value,
            geometry_type: "null",
          };

          let layerData: Layer = this.layerIcon;
          layerData.name = this.form.get("name").value;
          layerData.type_source = this.form.get("type_source").value;

          if (layerData.type_source === "file_sig") {
            layerData.file = this.form.get("source").value[0];
          } else if (layerData.type_source === "query") {
            (layerData.sql = this.form.get("sql").value),
              (layerData.connection = this.form.get("connection").value);
          } else {
            this.form.enable();
            this.toastrService.danger(
              this.translate.instant(
                "groups.layers.source_must_be_file_or_query"
              ),
              this.translate.instant("error"),
              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
            );
            return EMPTY;
          }

          return this.mapsService.addLayer(toFormData(layerData)).pipe(
            catchError((error: HttpErrorResponse) => {
              this.form.enable();
              this.toastrService.danger(
                error.error?.msg
                ? error.error.msg
                : this.translate.instant("groups.layers.error_adding_layer"),
                this.translate.instant("error"),
                { position: this.positions.BOTTOM_LEFT, duration: 5000 }
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

  customValidationFunction(formGroup: FormGroup): ValidationErrors {
    let type_source = formGroup.controls["type_source"].value;
    if (
      type_source === "file_sig" &&
      formGroup.controls["source"].value === null
    ) {
      formGroup.setErrors({ nameLengthFive: true } as ValidationErrors);
      return { nameLengthFive: true } as ValidationErrors;
    } else if (type_source && type_source != "file_sig") {
      if (formGroup.controls["sql"].value === null) {
        formGroup.setErrors({
          noSql: "Veillez entrer une requète SQL",
        } as ValidationErrors);
        return { noSql: "Veillez entrer une requète SQL" } as ValidationErrors;
      }
      let sql: string = formGroup.controls["sql"].value;

      if (!sql.includes("geom") || !sql.includes("id")) {
        formGroup.setErrors({
          sqlProblems: "Les colonnes 'id' et 'geom' sont obligatoires ",
        } as ValidationErrors);
        return {
          sqlProblems: "Les colonnes 'id' et 'geom' sont obligatoires ",
        } as ValidationErrors;
      }
      return null;
    }
    return null;
  }

  close() {
    this.dialogRef.close();
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

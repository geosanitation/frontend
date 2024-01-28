import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  NbDialogRef,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
} from "rxjs";
import {
  catchError,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators";
import {
  CustomStyle,
  EditStyle,
  VectorProvider,
} from "src/app/data/models/type";
import { StyleService } from "src/app/data/services/style.service";
import { VectorProviderService } from "src/app/data/services/vector-provider.service";
import { ClusterComponent } from "../cluster/cluster.component";
import { LineSimpleComponent } from "../line-simple/line-simple.component";
import { PointDiagramSimpleComponent } from "../point-diagram-simple/point-diagram-simple.component";
import { PointIconSimpleComponent } from "../point-icon-simple/point-icon-simple.component";
import { PolygonSimpleComponent } from "../polygon-simple/polygon-simple.component";
import { QmlComponent } from "../qml/qml.component";

@Component({
  selector: "app-edit-style",
  templateUrl: "./edit-style.component.html",
  styleUrls: ["./edit-style.component.scss"],
})
export class EditStyleComponent implements OnInit, OnDestroy {
  @Input() data: EditStyle;

  /**
   * Edit the style, if success, exit dialog
   */
  onEditInstance: () => void;
  onInitInstance: () => void;

  onDestroyInstance: () => void;

  /**
   * is the comp communicating with server ?
   */
  loading: boolean;

  styleType: BehaviorSubject<CustomStyle> = new BehaviorSubject<CustomStyle>(
    null
  );
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  nameStyle = new FormControl(null, [Validators.required]);
  provider$: Observable<VectorProvider>;
  customStyles$: Observable<CustomStyle[]>;
  positions = NbGlobalPhysicalPosition;

  /**
   * Form to edit a style
   */
  formEditStyle: FormGroup;

  @ViewChild(QmlComponent) qmlComponent: QmlComponent;
  @ViewChild(ClusterComponent) clusterComponent: ClusterComponent;
  @ViewChild(PointIconSimpleComponent)
  pointIconSimpleComponent: PointIconSimpleComponent;
  @ViewChild(PointDiagramSimpleComponent)
  pointDiagramSimpleComponent: PointDiagramSimpleComponent;
  @ViewChild(PolygonSimpleComponent)
  polygonSimpleComponent: PolygonSimpleComponent;
  @ViewChild(LineSimpleComponent) lineSimpleComponent: LineSimpleComponent;

  constructor(
    public dialogRef: NbDialogRef<EditStyleComponent>,
    private formBuilder: FormBuilder,
    private toastrService: NbToastrService,
    public translate: TranslateService,
    public StyleService: StyleService,
    public VectorProviderService: VectorProviderService,
    private cdRef: ChangeDetectorRef,
  ) {
    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
    };

    this.provider$ = onInit.pipe(
      switchMap(() => {
        return this.VectorProviderService.getVectorProvider(
          this.data.provider_vector_id
        ).pipe(
          catchError((value: HttpErrorResponse) => {
            this.toastrService.danger(
              "An error occured while loading the provider",
              this.translate.instant("error"),
              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
            );
            this.dialogRef.close(false);
            return EMPTY;
          })
        );
      }),
      shareReplay(1)
    );

    this.customStyles$ = onInit.pipe(
      switchMap(() => {
        return this.StyleService.listCustomStyles().pipe(
          catchError((value: HttpErrorResponse) => {
            this.toastrService.danger(
              "An error occured while loading all custom styles",
              this.translate.instant("error"),
              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
            );
            this.dialogRef.close(false);
            return EMPTY;
          })
        );
      })
    );

    this.formEditStyle = this.formBuilder.group({
      name: new FormControl(null, [Validators.required]),
      qml_file: new FormControl(null),
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (this.data){
      this.onInitInstance();
      this.styleType.next(this.data.customStyle)
      setTimeout(()=> {
        this.nameStyle.setValue(this.data.name)
        this.formEditStyle.get('name').setValue(this.data.name)
      })
    }
    this.styleType
      .pipe(
        tap((customStyle) => {
          if (customStyle == undefined) {
            this.formEditStyle = this.qmlComponent.form;
            this.onEditInstance = () => {
              this.qmlComponent.ondUpdateInstance();
            };
          } else if (customStyle.fucntion_name === "pointCluster") {
            this.formEditStyle = this.clusterComponent.form;
            this.onEditInstance = () => {
              this.clusterComponent.onUpdateInstance();
            };
          } else if (customStyle.fucntion_name === "point_icon_simple") {
            this.formEditStyle = this.pointIconSimpleComponent.form;
            this.onEditInstance = () => {
              this.pointIconSimpleComponent.onUpdateInstance();
            };
          } else if (customStyle.fucntion_name === "diagram_simple") {
            this.formEditStyle = this.pointDiagramSimpleComponent.form;
            this.onEditInstance = () => {
              this.pointDiagramSimpleComponent.onUpdateInstance();
            };
          } else if (customStyle.fucntion_name === "polygon_simple") {
            this.formEditStyle = this.polygonSimpleComponent.form;
            this.onEditInstance = () => {
              this.polygonSimpleComponent.onUpdateInstance();
            };
          } else if (customStyle.fucntion_name === "line_simple") {
            this.formEditStyle = this.lineSimpleComponent.form;
            this.onEditInstance = () => {
              this.lineSimpleComponent.onUpdateInstance();
            };
          }
          this.cdRef.detectChanges();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  close(): void {
    this.dialogRef.close(false);
  }

  /**
   * Change the type of project
   * @param type string
   */
  styleTypeChanged(type: CustomStyle): void {
    this.styleType.next(type);
  }
}
export function toFormData<T>(formValue: T) {
  const formData = new FormData();

  for (const key of Object.keys(formValue)) {
    const value = formValue[key];
    formData.append(key, value);
  }

  return formData;
}

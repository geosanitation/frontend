import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { ReplaySubject, Subject, EMPTY, Observable } from 'rxjs';
import { filter, tap, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { CustomStyle, Icon, Style } from 'src/app/data/models/type';
import { EditStyleComponent } from '../edit-style/edit-style.component';
import { StyleService } from 'src/app/data/services/style.service'
import { environment } from '../../../../../../environments/environment';
import { LayerField } from '../../../../../data/models/layer-field';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-point-diagram-simple',
  templateUrl: './point-diagram-simple.component.html',
  styleUrls: ['./point-diagram-simple.component.scss']
})
export class PointDiagramSimpleComponent implements OnInit {


  @Input() styleName: AbstractControl
  @Input() provider_vector_id: number
  @Input() provider_style_id: number
  @Input() customStyle: CustomStyle
  @Input() color: string
  @Input() id_server: string
  @Input() path_qgis: string

  onInitInstance: () => void
  public onUpdateInstance: () => void

  private readonly notifier: NotifierService;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  environment = environment
  form: FormGroup
  loading: boolean = false
  public presetValues: string[] = [];

  /**
   * list of field of the diagram
   */
  listFields$: Observable<Array<LayerField>>

  constructor(
    public styleService: StyleService,
    public dialogRef: MatDialogRef<EditStyleComponent, Style>,
    private formBuilder: FormBuilder,
    notifierService: NotifierService,
    public StyleService: StyleService,
    public dialog: MatDialog,
    public translate: TranslateService
  ) {

    this.form = this.formBuilder.group({
      name: this.styleName,
      fields: this.formBuilder.array([], [Validators.required])
    })

    const onUpdate: Subject<void> = new Subject<void>()
    this.onUpdateInstance = () => {
      onUpdate.next()
    }

    onUpdate.pipe(
      filter(() => this.form.valid),
      tap(() => { this.form.disable() }),
      switchMap(() => {
        let style = {
          'name': this.styleName.value,
          'fields': this.form.get('fields').value,
          'provider_style_id': this.provider_style_id,
          'custom_style_id': this.customStyle.custom_style_id,
          'provider_vector_id': this.provider_vector_id
        }
        return this.StyleService.updateStyle(style)
          .pipe(
            catchError((value: HttpErrorResponse) => {
              if (value.error.msg) {
                this.notifier.notify("error", value.error.msg)
              }
              else {
                this.notifier.notify("error", this.translate.instant('groups.layers.symbology_edit.error_updating_style'))
              }
              this.loading = false; this.form.enable()
              return EMPTY
            }),
            tap((res) => { this.loading = false; this.form.enable(); this.dialogRef.close(res) })
          )
      }),
      takeUntil(this.destroyed$)
    ).subscribe()

    const onInit: Subject<void> = new ReplaySubject<void>(1)
    this.onInitInstance = () => {
      onInit.next()
      onInit.complete()
    }

    this.listFields$ = onInit.pipe(
      switchMap(() => {
        return this.styleService.getAllFieldsOfVectorLayer(this.id_server, this.path_qgis, 'number').pipe(
          catchError((value: HttpErrorResponse) => {
            if (value.status != 404) {
              this.notifier.notify("error", "An error occured while loading fields")
            }
            return EMPTY
          })
        )
      })
    )
  }

  ngOnInit(): void {
    this.onInitInstance()
  }
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get fields(): FormArray {
    return this.form.get("fields") as FormArray
  }

  newField(): FormGroup {
    return this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      color: new FormControl('', [Validators.required]),
    })
  }

  addFields() {
    this.fields.push(this.newField());
  }

  removeField(i: number) {
    this.fields.removeAt(i);
  }
}

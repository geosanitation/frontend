import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { ReplaySubject, Subject, EMPTY } from 'rxjs';
import { filter, tap, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { CustomStyle, Icon, Style } from 'src/app/data/models/type';
import { environment } from '../../../../../../environments/environment';
import { EditStyleComponent } from '../edit-style/edit-style.component';
import { StyleService } from 'src/app/data/services/style.service'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-line-simple',
  templateUrl: './line-simple.component.html',
  styleUrls: ['./line-simple.component.scss']
})
export class LineSimpleComponent implements OnInit {

  
  @Input() styleName: AbstractControl
  @Input() provider_vector_id: number
  @Input() provider_style_id: number
  @Input() customStyle:CustomStyle
  @Input() lineColor: string
  @Input() lineWidth: number

  public onUpdateInstance: () => void

  private readonly notifier: NotifierService;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  environment = environment
  form: FormGroup
  loading: boolean = false
  public colorList = [
    { key: 'red', value: '#FF3A33' },
    { key: 'terracotta', value: '#E68673' },
    { key: 'orange', value: '#FF7733' },
    { key: 'amber', value: '#FFAA00' },
    { key: 'khaki', value: '#B3A17D' },
    { key: 'yellow', value: '#FFD11A' },
    { key: 'lime', value: '#BCD92B' },
    { key: 'grass', value: '#7ACC29' },
    { key: 'green', value: '#00CC66' },
    { key: 'moviikgreen', value: '#17E68F' },
    { key: 'jade', value: '#4D997D' },
    { key: 'teal', value: '#73DFE6' },
    { key: 'skyblue', value: '#4DC3FF' },
    { key: 'blue', value: '#0095FF' },
    { key: 'royalblue', value: '#0055FF' },
    { key: 'ultraviolet', value: '#6200EE' },
    { key: 'violet', value: '#8126FF' },
    { key: 'deeppurple', value: '#AA33FF' },
    { key: 'pink', value: '#FF99CC' },
    { key: 'strawberry', value: '#FD5B82' }
  ];
  public presetValues: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditStyleComponent, Style>,
    private formBuilder: FormBuilder,
    notifierService: NotifierService,
    public StyleService: StyleService,
    public translate: TranslateService
  ) {
    this.notifier = notifierService;

    this.presetValues = this.getColorValues()
    this.form = this.formBuilder.group({
      name: this.styleName,
      lineColor: new FormControl(this.lineColor, [Validators.required]),
      lineWidth: new FormControl(this.lineWidth, [Validators.required]),
      type: new FormControl('polygon_simple',[Validators.required]),
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
          'provider_style_id': this.provider_style_id,
          'custom_style_id': this.customStyle.custom_style_id,
          'lineColor': this.form.get('lineColor').value,
          'lineWidth': this.form.get('lineWidth').value,
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

  }

  ngOnInit(): void {
  }

  ngOnDestroy():void{
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnChanges(changes:SimpleChanges){
    if (changes['lineColor'] && this.lineColor) {
      this.form.get('lineColor').setValue(this.lineColor)
      this.form.get('lineWidth').setValue(this.lineWidth)
    }
  }

  getColorValues() {
    return this.colorList.map(c => c.value);
  }

  onColorPickerSelect(color:string, field:string) {
    this.form.get(field).setValue(color);
  }

}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { EMPTY, ReplaySubject, Subject } from 'rxjs';
import { catchError, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Style } from 'src/app/data/models/type';
import { StyleService } from 'src/app/data/services/style.service';
import { EditStyleComponent } from '../edit-style/edit-style.component';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-qml',
  templateUrl: './qml.component.html',
  styleUrls: ['./qml.component.scss']
})
export class QmlComponent implements OnInit, OnDestroy {

  @Input() styleName: AbstractControl
  @Input() provider_vector_id: number
  @Input() provider_style_id: number


  public ondUpdateInstance: () => void

  private readonly notifier: NotifierService;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  form: FormGroup
  loading: boolean = false

  constructor(
    public dialogRef: NbDialogRef<EditStyleComponent>,
    private formBuilder: FormBuilder,
    notifierService: NotifierService,
    public StyleService: StyleService,
    public translate: TranslateService
  ) {
    this.notifier = notifierService;

    this.form = this.formBuilder.group({
      name: this.styleName,
      qml_file: new FormControl(null, [Validators.required]),
    })

    const ondUpdate: Subject<void> = new Subject<void>()
    this.ondUpdateInstance = () => {
      ondUpdate.next()
    }

    ondUpdate.pipe(
      filter(() => this.form.valid),
      tap(() => { this.form.disable() }),
      switchMap(() => {
        let style = toFormData({
          'qml_file': this.form.get('qml_file').value[0],
          'name': this.styleName.value,
          'provider_style_id': this.provider_style_id,
          'provider_vector_id': this.provider_vector_id
        })
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

  /**
  * Is this form control has error ?
  * @param field string
  * @param error string
  * @returns boolean
  */
  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    try {
      return control.dirty && control.hasError(error);

    } catch (error) {
      return true
    }
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
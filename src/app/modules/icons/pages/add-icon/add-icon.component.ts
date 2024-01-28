import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import { concat, EMPTY, Observable } from "rxjs";
import { catchError, concatAll, take, tap, toArray } from "rxjs/operators";
import { Icon } from "../../../../data/models/type";
import { IconService } from "../../../../data/services/icon.service";
import { NbDialogRef, NbGlobalPhysicalPosition, NbToastrService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-add-icon",
  templateUrl: "./add-icon.component.html",
  styleUrls: ["./add-icon.component.scss"],
})
/**
 * Add icon one or multiple icon
 */
export class AddIconComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({});
  progress: number = 0;

  positions = NbGlobalPhysicalPosition;
  
  constructor(
    protected dialogRef: NbDialogRef<AddIconComponent>,
    private toastrService: NbToastrService,
    private formBuilder: FormBuilder,
    public IconService: IconService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initialiseForm();
  }

  close(): void {
    this.dialogRef.close(false);
  }

  /**
   * initalise the form
   */
  initialiseForm() {
    // this.form.addControl('category',new FormControl(null, [Validators.required]))
    this.form.addControl("attribution", new FormControl(null));
    this.form.addControl("tags", new FormControl([]));
    this.form.addControl("path", new FormControl(null, [Validators.required]));
    // this.form.addControl('path',new FormControl(null,[Validators.required, requiredFileType('svg')]))
  }

  hasError(field: string, error: string) {
    const control = this.form.get(field);
    try {
      return control.dirty && control.hasError(error);
    } catch (error) {
      return true;
    }
  }

  formatIconsToSave(): Observable<Icon>[] {
    let listFIle: FileList = this.form.get("path").value;

    let listRequest: Array<Observable<Icon>> = [];
    for (let index = 0; index < listFIle.length; index++) {
      let formIcon = toFormData({
        path: listFIle[index],
        name: listFIle[index].name.split(".")[0].toLowerCase(),
        // 'category':this.form.get('category').value,
        attribution: this.form.get("attribution").value,
        tags: JSON.stringify(this.form.get("tags").value),
      });
      listRequest.push(this.IconService.uploadIcon(formIcon));
    }
    return listRequest;
  }

  /**
   * Save icons
   */
  saveIcon() {
    this.form.disable();
    concat(this.formatIconsToSave())
      .pipe(
        concatAll(),
        toArray(),
        catchError((err) => {
          this.form.enable();
          this.toastrService.danger(
            this.translate.instant("groups.layers.error_saving_icons"),
            this.translate.instant("error"),
            { position: this.positions.BOTTOM_LEFT, duration: 5000 }
          );
          return EMPTY;
        }),
        tap((value) => {
          this.form.enable();
          this.toastrService.success(
            "Images upload successfully",
            this.translate.instant("error"),
            { position: this.positions.BOTTOM_LEFT, duration: 5000 }
          );
          this.dialogRef.close(value.filter((v) => v != undefined));
        }),
        take(1)
      )
      .subscribe();
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

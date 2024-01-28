import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NbDialogRef, NbGlobalPhysicalPosition, NbToastrService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { EMPTY, ReplaySubject, Subject } from "rxjs";
import { catchError, switchMap, takeUntil, tap } from "rxjs/operators";
import { environment } from "../../../../../environments/environment";
import { Icon } from "../../../../data/models/type";
import { IconService } from "../../../../data/services/icon.service";

@Component({
  selector: "app-update-icon",
  templateUrl: "./update-icon.component.html",
  styleUrls: ["./update-icon.component.scss"],
})
export class UpdateIconComponent implements OnInit {
  @Input() icon: Icon;

  onUpdateInstance: () => void;
  form: FormGroup = this.formBuilder.group({});
  progress: number = 0;
  url_prefix = environment.backendUrl;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  positions = NbGlobalPhysicalPosition;

  constructor(
    public dialogRef: NbDialogRef<UpdateIconComponent>,
    private formBuilder: FormBuilder,
    public IconService: IconService,
    private toastrService: NbToastrService,
    public translate: TranslateService
  ) {
    this.form.addControl(
      "category",
      new FormControl(null, [Validators.required])
    );
    this.form.addControl("attribution", new FormControl(null));
    this.form.addControl("icon_id", new FormControl(null));
    this.form.addControl(
      "tags",
      new FormControl([])
    );
    // this.form.addControl('path',new FormControl(null,[Validators.required]))

    const onUpdate: Subject<void> = new Subject<void>();
    this.onUpdateInstance = () => {
      onUpdate.next();
    };

    onUpdate
      .pipe(
        switchMap(() => {
          let formIcon = toFormData({
            category: this.form.get("category").value,
            attribution: this.form.get("attribution").value,
            icon_id: this.form.get("icon_id").value,
            tags: JSON.stringify(this.form.get("tags").value),
          });

          return this.IconService.updateIcon(formIcon).pipe(
            catchError((err) => {
              this.toastrService.danger(
                this.translate.instant("groups.layers.error_saving_icons"),
                this.translate.instant("error"),
                { position: this.positions.BOTTOM_LEFT, duration: 5000 }
              );
              return EMPTY;
            }),
            tap(() => {
              this.dialogRef.close(true);
            })
          );
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit(): void {
    if (this.icon) {
      setTimeout(() => {
        this.form.get("category").setValue(this.icon.category);
        this.form.get("attribution").setValue(this.icon.attribution);
        this.form.get("icon_id").setValue(this.icon.icon_id);
        this.form.get("tags").setValue(this.icon.tags.map((tag) => tag.name));
      }
      )
    }
  }
  close(): void {
    this.dialogRef.close(false);
  }

  hasError(field: string, error: string) {
    const control = this.form.get(field);
    try {
      return control.dirty && control.hasError(error);
    } catch (error) {
      return true;
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

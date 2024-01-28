import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NbDialogRef, NbGlobalPhysicalPosition, NbToastrService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
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
import { ORG_TYPES } from "src/app/data/models/actors";
import { ActorsService } from "src/app/data/services/actors.service";

@Component({
  selector: "geosanitation-add-organization-dialog",
  templateUrl: "./add-organization-dialog.component.html",
  styleUrls: ["./add-organization-dialog.component.scss"],
})
export class AddOrganizationDialogComponent implements OnInit {
  form: FormGroup;

  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  onAddInstance: () => void;
  positions = NbGlobalPhysicalPosition;

  org_types = ORG_TYPES
  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    public actorsService: ActorsService,
    protected ref: NbDialogRef<AddOrganizationDialogComponent>,
    private toastrService: NbToastrService
  ) {
    this.form = this.fb.group({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.email]),
      phone: new FormControl(null),
      address: new FormControl(null),
      website: new FormControl(null),
      org_type: new FormControl(null, [Validators.required]),
      activity_areas: new FormControl(null),
    });

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
          return this.actorsService.addOrganization(this.form.value).pipe(
            catchError(() => {
              this.toastrService.danger(
                this.translate.instant("actors.organization.error_adding_organization"),
                this.translate.instant("error"),
                { position: this.positions.BOTTOM_LEFT, duration: 5000 }
              );
              this.form.enable();
              return EMPTY;
            }),
            tap((organization) => {
              this.form.enable();
              this.ref.close(organization);
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
}

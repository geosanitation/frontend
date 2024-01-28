import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
} from "@angular/core";
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
import { ORG_TYPES, Organization } from "src/app/data/models/actors";
import { ActorsService } from "src/app/data/services/actors.service";

@Component({
  selector: "geosanitation-edit-organization-dialog",
  templateUrl: "./edit-organization-dialog.component.html",
  styleUrls: ["./edit-organization-dialog.component.scss"],
})
export class EditOrganizationDialogComponent implements OnInit {
  @Input() organization: Organization;

  form: FormGroup;

  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  onSubmitInstance: () => void;

  json = JSON;
  positions = NbGlobalPhysicalPosition;

  org_types = ORG_TYPES
  
  constructor(
    private fb: FormBuilder,
    public actorsService: ActorsService,
    protected ref: NbDialogRef<EditOrganizationDialogComponent>,
    public translate: TranslateService,
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

    const onSubmit: Subject<void> = new Subject<void>();
    this.onSubmitInstance = () => {
      onSubmit.next();
    };

    onSubmit
      .pipe(
        takeUntil(this.destroyed$),
        filter(() => this.form.valid),
        tap(() => {
          this.form.disable();
        }),
        switchMap(() => {
          return this.actorsService
            .updateOrganization(
              this.organization.organization_id,
              this.form.value
            )
            .pipe(
              catchError(() => {
              this.toastrService.danger(
                this.translate.instant("actors.organization.error_saving_organization"),
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

  ngAfterViewInit(): void {
    if (this.organization) {
      setTimeout(() => {
        this.form.get("name").setValue(this.organization.name);
        this.form.get("email").setValue(this.organization.email);
        this.form.get("phone").setValue(this.organization.phone);
        this.form.get("address").setValue(this.organization.address);
        this.form.get("website").setValue(this.organization.website);
        this.form.get("org_type").setValue(this.organization.org_type);
        this.form.get("activity_areas").setValue(this.organization.activity_areas);
      });
    }
  }

  close(result: boolean) {
    this.ref.close(result);
  }
}

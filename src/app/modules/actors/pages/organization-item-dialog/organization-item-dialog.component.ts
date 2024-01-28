import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { NbDialogRef, NbDialogService, NbGlobalPhysicalPosition, NbIconLibraries, NbToastrService } from "@nebular/theme";
import { EMPTY, ReplaySubject, Subject, catchError, filter, switchMap, takeUntil, tap } from "rxjs";
import { ORG_TYPES, Organization } from "src/app/data/models/actors";
import { StoreService } from "src/app/data/store/store.service";
import { EditOrganizationDialogComponent } from "../edit-organization-dialog/edit-organization-dialog.component";
import { ActorsService } from "src/app/data/services/actors.service";
import { HttpErrorResponse } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationDialogData, ConfirmationDialogComponent } from "src/app/modules/shared/pages/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "geosanitation-organization-item-dialog",
  templateUrl: "./organization-item-dialog.component.html",
  styleUrls: ["./organization-item-dialog.component.scss"],
})
export class OrganizationItemDialogComponent implements OnInit {
  @Input() organization: Organization;
  
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  /**
   * Emit to open an Organization
   */
  public onEditOrganizationInstance: (organization: Organization) => void;

  /**
   * Delete Organization
   */
  public onDeleteInstance: () => void;

  org_types = ORG_TYPES
  positions = NbGlobalPhysicalPosition;

  constructor(
    iconsLibrary: NbIconLibraries,
    public nbDialog: NbDialogService,
    public nbDialogRef: NbDialogRef<OrganizationItemDialogComponent>,
    public store: StoreService,
    public translate: TranslateService,
    private toastrService: NbToastrService,
    public actorService: ActorsService
  ) {

    iconsLibrary.registerFontPack("fa", {
      packClass: "fa",
      iconClassPrefix: "fa",
    });
    iconsLibrary.registerFontPack("far", {
      packClass: "far",
      iconClassPrefix: "fa",
    });
    iconsLibrary.registerFontPack("ion", { iconClassPrefix: "ion" });

    const onEdiOrganization: Subject<Organization> = new Subject<Organization>();
    this.onEditOrganizationInstance = (organization: Organization) => {
      onEdiOrganization.next(organization);
    };

    onEdiOrganization.pipe(
      takeUntil(this.destroyed$),
      switchMap((organization)=> {
        return this.nbDialog.open(EditOrganizationDialogComponent, {
          autoFocus: false,
          context: {
            organization: organization
          }
        }).onClose.pipe(
          filter((value) => value),
          tap(() => {
            this.nbDialogRef.close(true)
          })
        )
      })
    ).subscribe()


    const onDelete: Subject<void> = new Subject<void>();
    this.onDeleteInstance = () => {
      onDelete.next();
    };


    onDelete
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(() => {
          let data: ConfirmationDialogData = {
            confirmationTitle: this.translate.instant(
              "actors.organization.delete_org.confirmation_title",
              this.organization
            ),
            confirmationExplanation: this.translate.instant(
              "actors.organization.delete_org.confirmation_explanation",
              this.organization
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
                return this.actorService.deleteOrganization(this.organization.organization_id).pipe(
                  catchError((error: HttpErrorResponse) => {
                    this.toastrService.danger(
                      this.translate.instant("actors.organization.delete_org.error_deleting"),
                      this.translate.instant("error"),
                      { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                    );
                    return EMPTY;
                  }),
                  tap((response) => {
                    this.nbDialogRef.close(true);
                  })
                );
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

  close() {
    this.nbDialogRef.close();
  }

  getOrgType(value: string) {
    let org_type = this.org_types.find((org_type) => org_type.value === value)
    return org_type?.name
  }
}

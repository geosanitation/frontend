import { Component, OnInit } from "@angular/core";
import { Group, GroupWithLayers } from "../../../../data/models/type";
import { MatDialog } from "@angular/material/dialog";
import { MapsService } from "../../../../data/services/maps.service";
import { Subject, ReplaySubject, Observable, merge, EMPTY } from "rxjs";
import { catchError, filter, switchMap, tap } from "rxjs/operators";
import { AddGroupComponent } from "../add-group/add-group.component";
import { TranslateService } from "@ngx-translate/core";
import {
  NbDialogService,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from "@nebular/theme";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from "src/app/modules/shared/pages/confirmation-dialog/confirmation-dialog.component";
import { StoreService } from "src/app/data/store/store.service";

@Component({
  selector: "geosanitation-groups-list",
  templateUrl: "./groups-list.component.html",
  styleUrls: ["./groups-list.component.scss"],
})
export class GroupsListComponent implements OnInit {
  /**
   * get the list group
   */
  public onInitInstance: () => void;

  /**
   * Emit to add a group
   */
  public onAddGroupInstance: () => void;

  /**
   * Emit to edit a group
   */
  public onEditGroupInstance: (group: Group) => void;

  /**
   * Emit to delete a group
   */
  public onDeleteGroupInstance: (group: Group) => void;

  /**
   * group list of a map
   */
  groups$: Observable<Group[]>;

  loading: boolean = true;

  positions = NbGlobalPhysicalPosition;

  constructor(
    public dialog: MatDialog,
    public mapsService: MapsService,
    public translate: TranslateService,
    private nbDialog: NbDialogService,
    public store: StoreService,
    private toastrService: NbToastrService
  ) {
    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
    };

    const onAddGroup: Subject<void> = new Subject<void>();
    this.onAddGroupInstance = () => {
      onAddGroup.next();
    };

    const onEditGroup: Subject<GroupWithLayers> =
      new Subject<GroupWithLayers>();
    this.onEditGroupInstance = (group: GroupWithLayers) => {
      onEditGroup.next(group);
    };

    const onDeleteGroup: Subject<GroupWithLayers> =
      new Subject<GroupWithLayers>();
    this.onDeleteGroupInstance = (group: GroupWithLayers) => {
      onDeleteGroup.next(group);
    };

    this.groups$ = merge(
      onInit,
      onAddGroup.pipe(
        switchMap(() => {
          return this.nbDialog
            .open(AddGroupComponent, {
              context: {
                profil: 1,
                group: null,
              },
            })
            .onClose.pipe(
              filter((response) => response),
              tap(() => {
                this.loading = true;
              })
            );
        })
      ),
      onEditGroup.pipe(
        switchMap((group: GroupWithLayers) => {
          return this.nbDialog
            .open(AddGroupComponent, {
              context: {
                group: group,
                profil: 1,
              },
            })
            .onClose.pipe(
              filter((response) => response),
              tap(() => {
                this.loading = true;
              })
            );
        })
      ),
      onDeleteGroup.pipe(
        switchMap((group: GroupWithLayers) => {
          let dialogData: ConfirmationDialogData = {
            confirmationTitle: this.translate.instant(
              "groups.layers.delete_group"
            ),
            confirmationExplanation:
              this.translate.instant("groups.layers.delete_a_group") +
              " " +
              group.name +
              " ?",
            cancelText: this.translate.instant("cancel"),
            confirmText: this.translate.instant("delete"),
            danger: true,
          };
          return this.nbDialog
            .open(ConfirmationDialogComponent, {
              context: {
                data: dialogData,
              },
              autoFocus: false,
            })
            .onClose.pipe(
              filter((resultConfirmation) => resultConfirmation),
              tap(() => {
                this.loading = true;
              }),
              switchMap(() => {
                return this.mapsService.deleteGroup(group).pipe(
                  catchError(() => {
                    this.toastrService.danger(
                      this.translate.instant(
                        "groups.layers.error_loading_group.delete"
                      ),
                      this.translate.instant("error"),
                      { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                    );
                    return EMPTY;
                  })
                );
              })
            );
        })
      )
    ).pipe(
      switchMap(() => {
        return this.mapsService.getAllGroups().pipe(
          tap(() => {
            this.loading = false;
          }),
          catchError(() => {
            this.toastrService.danger(
              this.translate.instant("groups.error_getting_groups"),
              this.translate.instant("error"),
              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
            );
            this.loading = false;
            return EMPTY;
          })
        );
      })
    );
  }

  ngOnInit(): void {
    this.onInitInstance();
  }
}

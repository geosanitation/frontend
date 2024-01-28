import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { NotifierService } from "angular-notifier";
import { EMPTY, merge, Observable, of, ReplaySubject, Subject } from "rxjs";
import { catchError } from "rxjs/internal/operators/catchError";
import { filter, switchMap, tap } from "rxjs/operators";
import { IconService } from "../../../../data/services/icon.service";
import { AddIconComponent } from "../add-icon/add-icon.component";
import { UpdateIconComponent } from "../update-icon/update-icon.component";
import { Icon } from "../../../../data/models/type";
import { environment } from "../../../../../environments/environment";
import { NbDialogService, NbGlobalPhysicalPosition, NbToastrService } from "@nebular/theme";
import { ConfirmationDialogComponent, ConfirmationDialogData } from "src/app/modules/shared/pages/confirmation-dialog/confirmation-dialog.component";
@Component({
  selector: "app-icons",
  templateUrl: "./icons.component.html",
  styleUrls: ["./icons.component.scss"],
})
/**
 * comp icon handle
 */
export class IconsComponent implements OnInit {
  onInitInstance: () => void;
  onAddtInstance: () => void;
  onUpdatetInstance: (icon: Icon) => void;
  onDeletetInstance: (icon: Icon) => void;

  url_prefix = environment.backendUrl;
  onIconSelect: Subject<Icon> = new Subject<Icon>();
  searchResultIcon: Observable<Icon[]>;
  searchIconForm: FormGroup = this.fb.group({});

  loading_icon: boolean = true;

  objectKeys = Object;

  /**
   * list of icons, group by category
   */
  public iconList$: Observable<Array<{ [key: string]: Icon[] }>>;
  positions = NbGlobalPhysicalPosition;

  constructor(
    // public manageCompHelper: ManageCompHelper,
    public IconService: IconService,
    public fb: FormBuilder,
    public dialog: NbDialogService,
    public translate: TranslateService,
    private toastrService: NbToastrService
  ) {

    let searchControl = new FormControl(null, Validators.min(3));
    this.searchResultIcon = searchControl.valueChanges.pipe(
      filter(
        (search_word) =>
          typeof search_word === "string" && search_word.length > 2
      ),
      catchError((err) => of([])),
      switchMap((search_word) => {
        return this.IconService.searchIcon(search_word).pipe(
          catchError((err) => {
            this.toastrService.danger(
              this.translate.instant("groups.layers.error_searching_icons"),
              this.translate.instant("error"),
              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
            );
            return EMPTY;
          })
        );
      })
    );

    this.searchIconForm.addControl("search_word", searchControl);

    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
    };

    const onAdd: Subject<void> = new Subject<void>();
    this.onAddtInstance = () => {
      onAdd.next();
    };

    const onUpdate: Subject<Icon> = new Subject<Icon>();
    this.onUpdatetInstance = (icon: Icon) => {
      onUpdate.next(icon);
    };

    const onDelete: Subject<Icon> = new Subject<Icon>();
    this.onDeletetInstance = (icon: Icon) => {
      onDelete.next(icon);
    };

    this.iconList$ = merge(
      onInit.pipe(
        switchMap(() => {
          return this.IconService.getIconsGroupByCategory().pipe(
            tap(() => {
              this.loading_icon = false;
            }),
            catchError((err) => {
              this.toastrService.danger(
                this.translate.instant("groups.layers.error_loading_icons"),
                this.translate.instant("error"),
                { position: this.positions.BOTTOM_LEFT, duration: 5000 }
              );
              this.loading_icon = false;
              return EMPTY;
            })
          );
        })
      ),
      onAdd.pipe(
        switchMap(() => {
          return this.dialog
            .open(AddIconComponent, {
            })
            .onClose
            .pipe(
              filter((result) => result instanceof Array),
              tap(() => {
                this.loading_icon = true;
              }),
              switchMap((icons) => {
                return this.IconService.getIconsGroupByCategory().pipe(
                  tap(() => {
                    this.loading_icon = false;
                    this.onIconSelect.next(icons[0]);
                    setTimeout(() => {
                      this.onIconSelect.next(icons[0]);
                    }, 500);
                  }),
                  catchError((err) => {
                    this.toastrService.danger(
                      this.translate.instant("groups.layers.error_loading_icons"),
                      this.translate.instant("error"),
                      { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                    );
                    this.loading_icon = false;
                    return EMPTY;
                  })
                );
              })
            );
        })
      ),
      onUpdate.pipe(
        switchMap((icon) => {
          return this.dialog
            .open(UpdateIconComponent, {
              context: {icon}
            })
            .onClose
            .pipe(
              filter((result) => result),
              tap(() => {
                this.loading_icon = true;
              }),
              switchMap(() => {
                return this.IconService.getIconsGroupByCategory().pipe(
                  tap(() => {
                    this.loading_icon = false;
                  }),
                  catchError((err) => {
                    this.toastrService.danger(
                      this.translate.instant("groups.layers.error_loading_icons"),
                      this.translate.instant("error"),
                      { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                    );
                    this.loading_icon = false;
                    return EMPTY;
                  })
                );
              })
            );
        })
      ),
      onDelete.pipe(
        switchMap((icon) => {
          let data: ConfirmationDialogData = {
            confirmationTitle: this.translate.instant(
              "groups.layers.icons.delete.confirmation_title"
            ),
            confirmationExplanation: this.translate.instant(
              "groups.layers.icons.delete.confirmation_explanation",
              icon
            ),
            cancelText: this.translate.instant("no"),
            confirmText: this.translate.instant("yes"),
            danger: true,
          };
          
          return this.dialog
            .open(ConfirmationDialogComponent, {
              context: {
                data: data,
              }}).onClose
            .pipe(
              filter((resultConfirmation) => resultConfirmation),
              tap(() => {
                this.loading_icon = true;
              }),
              switchMap(() => {
                return this.IconService.deleteIcon(icon.icon_id).pipe(
                  catchError((err) => {
                    this.toastrService.danger(
                      this.translate.instant("groups.layers.error_deleting_icons"),
                      this.translate.instant("error"),
                      { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                    );
                    return EMPTY;
                  }),
                  switchMap(() => {
                    return this.IconService.getIconsGroupByCategory().pipe(
                      tap(() => {
                        this.loading_icon = false;
                      }),
                      catchError((err) => {
                        this.toastrService.danger(
                          this.translate.instant("groups.layers.error_loading_icons"),
                          this.translate.instant("error"),
                          { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                        );
                        this.loading_icon = false;
                        return EMPTY;
                      })
                    );
                  })
                );
              })
            );
        })
      )
    );
  }

  ngOnInit(): void {
    this.onInitInstance();
  }

  displaySelectedIcon(icon: Icon): string {
    if (icon) {
      return icon.name + ", " + icon.category;
    }
    return null;
  }
}

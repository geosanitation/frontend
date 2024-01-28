import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { NbGlobalPhysicalPosition, NbMenuItem, NbToastrService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { NotifierService } from "angular-notifier";
import {
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  switchMap,
  tap
} from "rxjs";
import { Group } from "src/app/data/models/type";
import { MapsService } from "src/app/data/services/maps.service";

@Component({
  selector: "geosanitation-sectors-list",
  templateUrl: "./sectors-list.component.html",
  styleUrls: ["./sectors-list.component.scss"],
})
export class SectorsListComponent implements OnInit {
  /**
   * get the list group
   */
  public onInitInstance: () => void;
  loading: boolean = true;
  /**
   * group list of a map
   */
  groups$: Observable<Group[]>;

  items$: Observable<NbMenuItem[]>;
  constructor(
    public dialog: MatDialog,
    public mapsService: MapsService,
    public translate: TranslateService,
    public router: Router,
    private toastrService: NbToastrService
  ) {
    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
    };

    this.groups$ = onInit.pipe(
      switchMap(() => {
        return this.mapsService.getAllGroups().pipe(
          tap(() => {
            this.loading = false;
          }),
          catchError(() => {
            let positions = NbGlobalPhysicalPosition;
            this.toastrService.danger(
              this.translate.instant("groups.error_getting_groups"),
              this.translate.instant("error"),
              {position: positions.BOTTOM_LEFT, duration: 5000}
            );
            this.loading = false;
            return EMPTY;
          }),
        );
      })
    );
  }

  ngOnInit(): void {
    this.onInitInstance()
  }

  openGroup(group: Group){
    this.router.navigate(
      [
        'map',
        'groups',
        group.group_id,
        'layers'
      ]
    )
  }
}

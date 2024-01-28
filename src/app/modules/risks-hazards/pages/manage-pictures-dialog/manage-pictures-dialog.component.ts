import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import {
  NbDialogRef,
  NbDialogService,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import {
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  debounceTime,
  filter,
  map,
  merge,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { PIC_STATUS, PublicPicture } from "src/app/data/models/risks-hazards";
import { RisksHazardsService } from "src/app/data/services/risks-hazards.service";
import { EditPictureDialogComponent } from "../edit-picture-dialog/edit-picture-dialog.component";
import { environment } from "src/environments/environment";

@Component({
  selector: "geosanitation-manage-pictures-dialog",
  templateUrl: "./manage-pictures-dialog.component.html",
  styleUrls: ["./manage-pictures-dialog.component.scss"],
})
export class ManagePicturesDialogComponent implements OnInit {
  /**
   * get the list of public pictures
   */
  public onInitInstance: () => void;

  /**
   * Emit to sort column
   */
  onSortChangeInstance: (e: Sort) => void;

  /**
   * Emit to change page
   */
  onPageChangeInstance: (e: PageEvent) => void;

  /**
   * Emit to open a public picture
   */
  onOpenPublicPictureInstance: (publiPicture: PublicPicture) => void;

  /**
   * Public picture list
   */
  publicPictures$: Observable<PublicPicture[]>;

  displayedColumns: string[] = [
    "image",
    "description",
    "uploader_name",
    "uploader_email",
    "taken_at",
    "updated_at",
  ];

  environment = environment;

  pics_status = PIC_STATUS;
  positions = NbGlobalPhysicalPosition;
  searchForm: FormGroup;
  loading: boolean = true;
  publicPicturesCount: number = 0;
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set sort_(sort: MatSort) {
    if (sort) {
      sort.sortChange
        .pipe(
          takeUntil(this.destroyed$),
          tap((e: Sort) => {
            this.onSortChangeInstance(e);
          })
        )
        .subscribe();
    }
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatPaginator) set paginator_(paginator: MatPaginator) {
    if (paginator) {
      paginator.page
        .pipe(
          takeUntil(this.destroyed$),
          tap((e: PageEvent) => {
            this.onPageChangeInstance(e);
          })
        )
        .subscribe();
    }
  }

  constructor(
    protected ref: NbDialogRef<ManagePicturesDialogComponent>,
    public risksHazardsService: RisksHazardsService,
    public nbDialog: NbDialogService,
    public translate: TranslateService,
    public formBuilder: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.searchForm = this.formBuilder.group({
      searchWord: new FormControl(""),
      is_approved: new FormControl(false),
    });

    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
    };

    const onSortChange: Subject<Sort> = new Subject<Sort>();
    this.onSortChangeInstance = (e: Sort) => {
      onSortChange.next(e);
    };

    const onPageChange: Subject<PageEvent> = new Subject<PageEvent>();
    this.onPageChangeInstance = (e: PageEvent) => {
      onPageChange.next(e);
    };

    const onOpenPublicPicture: Subject<PublicPicture> =
      new Subject<PublicPicture>();
    this.onOpenPublicPictureInstance = (publicPicture: PublicPicture) => {
      onOpenPublicPicture.next(publicPicture);
    };

    this.publicPictures$ = merge(
      onInit,
      onSortChange,
      onPageChange,
      this.searchForm.valueChanges.pipe(tap(() => this.paginator?.firstPage())),
      onOpenPublicPicture.pipe(
        switchMap((publicPicture: PublicPicture) => {
          return this.nbDialog
            .open(EditPictureDialogComponent, {
              autoFocus: false,
              context: {
                publicPicture: publicPicture,
              },
            })
            .onClose.pipe(filter((resultConfirmation) => resultConfirmation));
        })
      )
    ).pipe(
      debounceTime(500),
      switchMap((params) => {
        this.loading = true;
        let ordering = this.sort?.direction == "desc" ? "-" : "";
        let field = this.sort?.active ? this.sort?.active : "updated_at";
        let filter: string = "";
        let pageSize = this.paginator ? this.paginator.pageSize : 10;
        let pageIndex = this.paginator ? this.paginator.pageIndex + 1 : 1;
        if (this.searchForm.get("searchWord")?.value) {
          filter += "&search=" + this.searchForm.get("searchWord").value;
        }
        filter += "&is_approved=" + this.searchForm.get("is_approved").value;
        
        filter += `&page_size=${pageSize}&page=${pageIndex}`;
        return this.risksHazardsService
          .getPublicPictures("ordering=" + ordering + field + filter)
          .pipe(
            catchError(() => {
              this.toastrService.danger(
                this.translate.instant(
                  "risks_hazards.instamap.error_getting_pictures"
                ),
                this.translate.instant("error"),
                { position: this.positions.BOTTOM_LEFT, duration: 5000 }
              );
              this.loading = false;
              return EMPTY;
            }),
            map((picPaginated) => {
              this.publicPicturesCount = picPaginated.count;
              return picPaginated.results;
            }),
            tap(() => (this.loading = false))
          );
      })
    );
  }

  ngOnInit(): void {
    this.onInitInstance();
  }

  close(result: boolean) {
    this.ref.close(result);
  }

  clearSearch() {
    this.searchForm.get("searchWord").setValue("");
  }
}

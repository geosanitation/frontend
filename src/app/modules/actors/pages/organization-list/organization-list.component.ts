import { Component, OnInit, ViewChild } from "@angular/core";
import {
  NbDialogService,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from "@nebular/theme";
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
import { ORG_TYPES, Organization } from "src/app/data/models/actors";
import { ActorsService } from "src/app/data/services/actors.service";
import { StoreService } from "src/app/data/store/store.service";
import { AddOrganizationDialogComponent } from "../add-organization-dialog/add-organization-dialog.component";
import { OrganizationItemDialogComponent } from "../organization-item-dialog/organization-item-dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { MatSort, Sort } from "@angular/material/sort";
import { MatPaginator, PageEvent } from "@angular/material/paginator";

@Component({
  selector: "geosanitation-organization-list",
  templateUrl: "./organization-list.component.html",
  styleUrls: ["./organization-list.component.scss"],
})
export class OrganizationListComponent implements OnInit {
  /**
   * get the list Organization
   */
  public onInitInstance: () => void;

  /**
   * Emit to add an Organization
   */
  public onAddOrganizationInstance: () => void;

  /**
   * Emit to open an Organization
   */
  public onOpenOrganizationInstance: (organization: Organization) => void;

  /**
   * Emit to delete an Organization
   */
  public onDeleteOrganizationInstance: (organization: Organization) => void;
  /**
   * Emit to sort name user column
   */
  onSortChangeInstance: (e: Sort) => void;

  /**
   * Emit to change page
   */
  onPageChangeInstance: (e: PageEvent) => void;
  

  /**
   * Organization list
   */
  organizations$: Observable<Organization[]>;

  displayedColumns: string[] = [
    "name",
    "email",
    "phone",
    "address",
    "website",
    "org_type",
  ];

  positions = NbGlobalPhysicalPosition;

  org_types = ORG_TYPES;
  searchForm: FormGroup;
  loading: boolean = true
  organisationCount: number = 0
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
    public store: StoreService,
    public actorsService: ActorsService,
    public nbDialog: NbDialogService,
    public translate: TranslateService,
    public formBuilder: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.searchForm = this.formBuilder.group({
      name: new FormControl(""),
      org_type: new FormControl(""),
    });
    const onInit: Subject<void> = new ReplaySubject<void>(1);
    this.onInitInstance = () => {
      onInit.next();
    };
    const onAddOrganization: Subject<void> = new Subject<void>();
    this.onAddOrganizationInstance = () => {
      onAddOrganization.next();
    };

    const onOpenOrganization: Subject<Organization> =
      new Subject<Organization>();
    this.onOpenOrganizationInstance = (organization: Organization) => {
      onOpenOrganization.next(organization);
    };

    const onSortChange: Subject<Sort> = new Subject<Sort>();
    this.onSortChangeInstance = (e: Sort) => {
      onSortChange.next(e);
    };

    const onPageChange: Subject<PageEvent> = new Subject<PageEvent>();
    this.onPageChangeInstance = (e: PageEvent) => {
      onPageChange.next(e);
    };


    this.organizations$ = merge(
      onInit,
      onSortChange,
      onPageChange,
      this.searchForm.valueChanges.pipe(
        tap(() => this.paginator?.firstPage())
      ),
      onAddOrganization.pipe(
        switchMap(() => {
          return this.nbDialog
            .open(AddOrganizationDialogComponent, {
              autoFocus: false,
            })
            .onClose.pipe(filter((resultConfirmation) => resultConfirmation));
        })
      ),
      onOpenOrganization.pipe(
        switchMap((organization: Organization) => {
          return this.nbDialog
            .open(OrganizationItemDialogComponent, {
              autoFocus: false,
              context: {
                organization: organization,
              },
            })
            .onClose.pipe(filter((resultConfirmation) => resultConfirmation));
        })
      )
    ).pipe(
      debounceTime(500),
      switchMap((params) => {
        this.loading = true
        let ordering = this.sort?.direction == "desc" ? "-" : "";
        let field = this.sort?.active ? this.sort?.active : "name";
        let filter: string = "";
        let pageSize = this.paginator ? this.paginator.pageSize : 20
        let pageIndex = this.paginator ? this.paginator.pageIndex + 1 : 1
        if (this.searchForm.get('name')?.value) {
          filter += "&search=" + this.searchForm.get('name').value;
        }
        if (this.searchForm.get('org_type')?.value) {
          filter += "&org_type=" + this.searchForm.get('org_type').value;
        }
        filter += `&page_size=${pageSize}&page=${pageIndex}`
        return this.actorsService.getOrganizations("ordering=" + ordering + field + filter).pipe(
          catchError(() => {
            this.toastrService.danger(
              this.translate.instant(
                "actors.organization.error_loading_organization"
              ),
              this.translate.instant("error"),
              { position: this.positions.BOTTOM_LEFT, duration: 5000 }
            );
            this.loading = false
            return EMPTY;
          }),
          map((orgPaginated) => {
            this.organisationCount = orgPaginated.count
            return orgPaginated.results
          }),
          tap(() => this.loading = false)
        );
      })
    );
  }

  ngOnInit(): void {
    this.onInitInstance();
  }

  getOrgType(value: string) {
    let org_type = this.org_types.find((org_type) => org_type.value === value);
    return org_type?.name;
  }

  clearSearch() {
    this.searchForm.get('name').setValue("")
  }
}

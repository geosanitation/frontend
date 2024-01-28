import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { NbDialogService, NbSidebarService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { NotifierService } from "angular-notifier";
import { Layer } from "leaflet";
import {
  catchError,
  EMPTY,
  map,
  ReplaySubject,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { MapsService } from "src/app/data/services/maps.service";
import { StoreService } from "src/app/data/store/store.service";
import { LayerDetailsComponent } from "../layer-details/layer-details.component";

@Component({
  selector: "geosanitation-layer-details-layout",
  templateUrl: "./layer-details-layout.component.html",
  styleUrls: ["./layer-details-layout.component.scss"],
})
export class LayerDetailsLayoutComponent implements OnInit {
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  private readonly notifier: NotifierService;

  constructor(
    private route: ActivatedRoute,
    public Router: Router,
    public notifierService: NotifierService,
    public translate: TranslateService,
    public mapService: MapsService,
    public dialog: MatDialog,
    public store: StoreService,
    private sidebarService: NbSidebarService,
    private nbDialog: NbDialogService
  ) {
    this.notifier = notifierService;
    this.route.paramMap
      .pipe(
        takeUntil(this.destroyed$),
        map((params: ParamMap) => {
          if (params.get("layer_id") == undefined) {
            this.Router.navigate(["groups"]);
          }
          return params.get("layer_id");
        }),
        switchMap((params) => {
          let layer_id = Number(params);
          this.store.openedLayerId$.next(layer_id);
          return this.mapService.getLayer(layer_id).pipe(
            catchError(() => {
              this.notifierService.notify(
                "error",
                this.translate.instant("groups.layers.error_loading_layer")
              );
              this.Router.navigate(["groups"]);
              return EMPTY;
            }),
            switchMap((layer) => {
              return this.nbDialog
                .open(LayerDetailsComponent, {
                  context: {
                    layer: layer,
                  },
                  autoFocus: false,
                  // hasBackdrop: false
                })
                .onClose.pipe(
                  tap((value) => {
                    let group_id = this.store.expandedGroupId;
                    this.Router.navigate(["groups", group_id, "layers"]);
                    this.store.reloadGroup$.next(group_id);
                    this.store.openedLayerId$.next(null);
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
}

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import {
  NbDialogService,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { EMPTY, Observable, Subject, merge } from "rxjs";
import { catchError, filter, map, switchMap, tap } from "rxjs/operators";
import { StoreService } from "src/app/data/store/store.service";
import { environment } from "../../../../../environments/environment";
import { GroupWithLayers, Layer } from "../../../../data/models/type";
import { MapsService } from "../../../../data/services/maps.service";
import { AddLayerComponent } from "../add-layer/add-layer.component";

@Component({
  selector: "geosanitation-layers-list",
  templateUrl: "./layers-list.component.html",
  styleUrls: ["./layers-list.component.scss"],
})
export class LayersListComponent implements OnInit {
  /**
   * Emit to add a layer
   */
  public onAddLayerInstance: (group: GroupWithLayers) => void;

  /**
   * group
   */
  group$: Observable<GroupWithLayers>;
  loading: boolean = true;

  backendUrl = environment.backendUrl;

  /**
   * Emit to open a layer
   */
  public onOpenLayerInstance: (layer: Layer) => void;
  positions = NbGlobalPhysicalPosition;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public translate: TranslateService,
    public mapService: MapsService,
    public store: StoreService,
    public dialog: NbDialogService,
    private toastrService: NbToastrService
  ) {
    const onAddLayer: Subject<GroupWithLayers> = new Subject<GroupWithLayers>();
    this.onAddLayerInstance = (group: GroupWithLayers) => {
      onAddLayer.next(group);
    };

    this.group$ = merge(
      this.store.reloadGroup$.pipe(
        map((group_id) => {
          return group_id;
        })
      ),
      this.route.paramMap.pipe(
        tap(() => {
          this.loading = true;
        }),
        map((params: ParamMap) => {
          if (params.get("group_id") == undefined) {
            this.router.navigate(["groups"]);
          }
          return Number(params.get("group_id"));
        }),
        map((group_id) => {
          return group_id;
        })
      ),
      onAddLayer.pipe(
        filter((group) => group != undefined),
        switchMap((group) => {
          return this.dialog
            .open(AddLayerComponent, {
              context: { group },
            })
            .onClose.pipe(
              filter((createdLayer) => createdLayer),
              tap(() => {
                this.loading = true;
              }),
              switchMap((createdLayer: Layer) => {
                return mapService.getLayer(createdLayer.layer_id).pipe(
                  catchError(() => {
                    this.toastrService.danger(
                      this.translate.instant(
                        "groups.layers.error_loading_layer"
                      ),
                      this.translate.instant("error"),
                      { position: this.positions.BOTTOM_LEFT, duration: 5000 }
                    );
                    this.loading = false;
                    return EMPTY;
                  }),
                  map((layer: Layer) => {
                    return group.group_id;
                  })
                );
              })
            );
        })
      )
    ).pipe(
      switchMap((group_id) => {
        return this.getGroup(group_id);
      })
    );

    this.onOpenLayerInstance = (layer: Layer) => {
      this.store.openedLayerId$.next(layer.layer_id);
      this.router.navigate(["groups", layer.group, "layers", layer.layer_id]);
    };
  }

  getGroup(group_id: number) {
    return this.mapService.getGroup(group_id).pipe(
      tap(() => {
        this.store.expandedGroupId$.next(group_id);
        this.loading = false;
      }),
      catchError(() => {
        this.toastrService.danger(
          this.translate.instant("groups.layers.error_getting_layers"),
          this.translate.instant("error"),
          { position: this.positions.BOTTOM_LEFT, duration: 5000 }
        );
        this.loading = false;
        return EMPTY;
      })
    );
  }

  ngOnInit(): void {}
}

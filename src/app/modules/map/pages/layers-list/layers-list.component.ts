import { Component, OnInit, QueryList, ViewChildren } from "@angular/core";
import { Location } from "@angular/common";
import {
  catchError,
  EMPTY,
  map,
  Observable,
  ReplaySubject,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs";
import { Group, GroupWithLayers, Layer } from "src/app/data/models/type";
import { NotifierService } from "angular-notifier";
import { TranslateService } from "@ngx-translate/core";
import { MapsService } from "src/app/data/services/maps.service";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { DataOsmLayersServiceService } from "src/app/data/services/data-som-layers-service.service";
import { StoreService } from "src/app/data/store/store.service";
import { MatSelectionList } from "@angular/material/list";
import { CartoHelper } from "src/app/helper/carto.helper";
import { environment } from "src/environments/environment";
import { NbToastrService, NbGlobalPhysicalPosition } from "@nebular/theme";

@Component({
  selector: "geosanitation-layers-list",
  templateUrl: "./layers-list.component.html",
  styleUrls: ["./layers-list.component.scss"],
})
export class LayersListComponent implements OnInit {
  /**
   * group
   */
  group$: Observable<GroupWithLayers>;
  loading: boolean = true;
  env = environment
  
  @ViewChildren(MatSelectionList) set matSelectionLists (matSelectionLists:QueryList<MatSelectionList>){
    if (matSelectionLists) {
      matSelectionLists.map((matSelectionList)=>{
        matSelectionList.selectionChange.pipe(
          withLatestFrom(this.group$),
          tap((parameters)=>{
            let isOptionSelected:boolean = parameters[0].option.selected
            let layer:Layer = parameters[0].option.value
            let group: Group = parameters[1]
  
            if (isOptionSelected) {
              try {
                this.dataLayerService.addLayer(layer, this.store.mainMap, group)
              } catch (error) {
                parameters[0].option.toggle()
              }
            }else{
              try {
               this.dataLayerService.removeLayer(layer.layer_id, this.store.mainMap)
              } catch (error) {
                parameters[0].option.toggle()
                
              }
            }
          })
        ).subscribe()
      })

    }
    
  }

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    public Router: Router,
    public translate: TranslateService,
    public mapService: MapsService,
    public dataLayerService: DataOsmLayersServiceService,
    public store: StoreService,
    private toastrService: NbToastrService
  ) {
    this.group$ = this.route.paramMap.pipe(
      tap(() => {
        this.loading = true;
      }),
      map((params: ParamMap) => {
        if (params.get("group_id") == undefined) {
          this.Router.navigate(["groups"]);
        }
        return Number(params.get("group_id"));
      }),
      switchMap((group_id) => {
        return this.mapService.getGroup(group_id).pipe(
          tap(() => {
            this.loading = false;
          }),
          catchError(() => {
            let positions = NbGlobalPhysicalPosition;
            this.toastrService.danger(
              this.translate.instant("groups.layers.error_getting_layers"),
              this.translate.instant("error"),
              {position: positions.BOTTOM_LEFT, duration: 5000}
            );
            this.loading = false;
            return EMPTY;
          })
        );
      })
    );
  }

  ngOnInit(): void {}

  goBack() {
    this.location.back();
  }


  isLayerInMap(layer:Layer){
   
    return new CartoHelper(this.store.mainMap).getLayerByPropertiesCatalogueGeosm({
      couche_id: layer.layer_id,
      type: 'couche'
    }).length > 0
}

/**
 * Is this layer entire defined in the adminstrative panel ?
 * If it is not, we can not add it to the map
 * @param layer Layer
 */
shouldDisabled(layer:Layer):boolean{
  if ( (layer.providers.length == 0 || layer.providers?.filter((provider)=>provider.vp.state == 'good').length == 0) ) {
    return true
  }else{
    return false
  }
}

}

import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { NotifierService } from "angular-notifier";
import { BehaviorSubject, catchError, EMPTY, tap } from "rxjs";
import { AuthService } from "../../core/service/auth.service";
import { Entreprise, GroupUser, User } from "../models/account";
import { Map, TileLayer, OSM, View, fromLonLat, XYZ, LayerGroup } from "src/app/ol-module"
// import BaseLayerOptions from 'ol-ext/control/LayerSwitcherImage'
// import GroupLayerOptions from 'ol-ext/control/LayerSwitcherImage'
// import LayerSwitcherImage from 'ol-ext/control/LayerSwitcherImage';

@Injectable({
  providedIn: "root",
})
export class StoreService {

  readonly mainMap$ = new BehaviorSubject<Map>(null);
  get mainMap() {
    return this.mainMap$.value;
  }

  readonly user$ = new BehaviorSubject<User>(null);
  get user() {
    return this.user$.value;
  }

  readonly expandedGroupId$ = new BehaviorSubject<number>(null);
  get expandedGroupId() {
    return this.expandedGroupId$.value;
  }

  readonly openedLayerId$ = new BehaviorSubject<number>(null);
  get openedLayerId() {
    return this.openedLayerId$.value;
  }

  readonly reloadGroup$ = new BehaviorSubject<number>(null);

  // readonly layersInMap$: BehaviorSubject<Array<LayerSpecification>> = new BehaviorSubject<Array<LayerSpecification>>([])
  // get layersInMap() {
  //   return this.layersInMap$.value;
  // }

  
  readonly enterprises$ = new BehaviorSubject<Array<Entreprise>>([]);
  get enterprises() {
    return this.enterprises$.value;
  }

  readonly groupUsers$ = new BehaviorSubject<Array<GroupUser>>([]);
  get groupUsers() {
    return this.groupUsers$.value;
  }


  readonly isSatellite$ = new BehaviorSubject<boolean>(false);
  get isSatellite() {
    return this.isSatellite$.value;
  }
  
  constructor(
    private authService: AuthService,
    public notifier: NotifierService,
    public translate: TranslateService
  ) { }

  /**
   * Load user : Fetch user data and user client data and put in store
   * @returns
   */
  loadUser() {
    return this.authService
      .getUser()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.notifier.notify(
            "error",
            this.translate.instant("user.loading_error")
          );
          return EMPTY;
        })
      )
      .pipe(
        tap((user) => {
          this.user$.next(user);
        })
      );
  }
}

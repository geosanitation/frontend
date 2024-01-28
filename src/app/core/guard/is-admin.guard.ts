import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, tap, map, switchMap } from "rxjs/operators";
import { StoreService } from "../../data/store/store.service";
import { AuthService } from "../service/auth.service";

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    public authService: AuthService,
    public Router: Router,
    public store: StoreService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (
      localStorage.getItem("refresh") ||
      (!localStorage.getItem("refresh") && localStorage.getItem("public_token"))
    ) {
      return this.authService.getUser().pipe(
        catchError(() => {
          this.Router.navigate(["authent"]);
          return of(false);
        }),
        switchMap((_) => {
          return this.store.loadUser().pipe(
            catchError(() => {
              this.Router.navigate(["authent"]);
              return of(false);
            }),
            switchMap((_) => {
              if (this.store.user && this.store.user.is_superuser) {
                return of(true);
              } else {
                this.Router.navigate(["map"]);
                return EMPTY;
              }
            })
          );
        })
      );
    } else {
      this.Router.navigate(["authent"]);
      return of(false);
    }
  }
}

import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { AuthService } from "../service/auth.service";
import { Observable, catchError, map, of, switchMap } from "rxjs";
import { StoreService } from "../../data/store/store.service";

@Injectable()
export class AuthGuard implements CanActivate {
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
          this.Router.navigate(["auth"]);
          return of(false);
        }),
        switchMap((_) => {
          return this.store.loadUser().pipe(
            catchError(() => {
              this.Router.navigate(["auth"]);
              return of(false);
            }),
            map((_) => {
              return true;
            })
          );
        })
      );
    } else {
      this.Router.navigate(["auth"]);
      return of(false);
    }
  }
}

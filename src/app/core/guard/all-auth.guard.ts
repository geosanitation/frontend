import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, filter, map, switchMap } from "rxjs/operators";
import { AuthService } from "../service/auth.service";
import { User } from "../../data/models/account";
import { StoreService } from "../../data/store/store.service";

@Injectable({
  providedIn: "root",
})
export class AllAuthGuard implements CanActivate {
  constructor(
    public authService: AuthService,
    public Router: Router,
    public store: StoreService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (localStorage.getItem("refresh")) {
      return this.authService.getUser().pipe(
        catchError(() => {
          return of(true);
        }),
        filter((user) => !!user),
        switchMap((_) => {
          return this.store.loadUser().pipe(
            catchError(() => {
              return of(true);
            }),
            map((_) => {
              return true;
            })
          );
        })
      );
    }
    return true;
  }
}

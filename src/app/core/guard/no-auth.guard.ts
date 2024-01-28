import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthService } from "../service/auth.service";
import { User } from "../../data/models/account";

@Injectable({
  providedIn: "root",
})
export class NoAuthGuard implements CanActivate {
  constructor(public authService: AuthService, public Router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (localStorage.getItem("refresh")) {
      return this.authService.getUser().pipe(
        catchError(() => {
          return of(false);
        }),
        map((user: boolean | User) => {
          if (user) {
            this.Router.navigate([""]);
            return false;
          } else {
            return true;
          }
        })
      );
    }
    return true;
  }
}

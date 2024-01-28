import { Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { StoreService } from "src/app/data/store/store.service";
import { AuthService } from "../service/auth.service";

export class ThemeGuard {
    static forTheme(theme_id: number) {

        @Injectable({
            providedIn: 'root'
        })
        class ThemeCheck implements CanActivate {
            constructor(public authService: AuthService, public Router: Router, public store: StoreService) { }
            canActivate(
                route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot
            ): Observable<boolean> {

                return this.store.loadUser().pipe(
                    catchError(() => {
                        this.Router.navigate(["authent"]);
                        return of(false);
                    }),
                    switchMap((_) => {
                        if (this.store.user) {

                            if (this.store.user.is_superuser) {
                                return of(true);
                            }

                            if (this.store.user.maps.includes(theme_id)) {
                                return of(true);
                            } else if (this.store.user.maps.length > 0) {
                                if (this.store.user.maps.includes(1)) {
                                    this.Router.navigate(["map"]);
                                    return of(false);
                                } else if (this.store.user.maps.includes(2)) {
                                    this.Router.navigate(["land"]);
                                    return EMPTY;
                                }
                                this.authService.logOut()
                                this.Router.navigate(["authent"]);
                                return of(false);
                            }
                            this.authService.logOut()
                            this.Router.navigate(["authent"]);
                            return of(false);
                        } else {
                            this.authService.logOut()
                            this.Router.navigate(["authent"]);
                            return of(false);
                        }
                    })
                );

            }

        }
        return ThemeCheck

    }
}

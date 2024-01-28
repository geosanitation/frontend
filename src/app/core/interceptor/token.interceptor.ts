import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  filter,
  Observable,
  switchMap,
  throwError,
} from "rxjs";
import { AuthService } from "../service/auth.service";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class TokenInterceptor implements HttpInterceptor {
  constructor(public AuthService: AuthService) {}

  private isRefreshing = false;

  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  /**
   * add access token
   * @param request
   * @param accessToken
   * @returns
   */
  private addAccessToken(
    request: HttpRequest<any>,
    accessToken: string
  ): HttpRequest<any> {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  /**
   * handle 401 error
   * @param request
   * @param next
   * @returns
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      let token = localStorage.getItem("token");
      if (token) {
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);
        return this.AuthService.refreshToken().pipe(
          switchMap((token) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(token.access);
            return next.handle(this.addAccessToken(request, token.access));
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
      } else {
        this.AuthService.logOut();
        return EMPTY;
      }
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token),
        switchMap((accessToken) => {
          return next.handle(this.addAccessToken(request, accessToken));
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
    }
  }

  /**
   * intercept
   * @param request
   * @param next
   * @returns
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes(environment.backendUrl)) {
      let token = localStorage.getItem("token");
      if (token) {
        request = this.addAccessToken(request, token);
      }
      return next.handle(request).pipe(
        catchError((error) => {
          if (
            error instanceof HttpErrorResponse &&
            error.status === 401 &&
            !request.url.includes("jwt/refresh/") &&
            !request.url.includes("jwt/create/")
          ) {
            return this.handle401Error(request, next);
          } else {
            return throwError(error);
          }
        })
      );
    }

    return next.handle(request);
  }
}

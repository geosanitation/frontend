import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "./../../../environments/environment";
import { EMPTY, Observable } from "rxjs";
import { TokenResponse, User } from "../../data/models/account";
import { catchError, tap } from "rxjs/operators";
const backendUrl = environment.backendUrl;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private http: HttpClient) {}

  /**
   * Get the user connected
   * @param token string
   * @returns Observable<User>
   */
  getUser(): Observable<User> {
    return this.http.get<User>(backendUrl + "/auth/users/me/").pipe(
      catchError((err) => {
        this.logOut();
        return EMPTY;
      })
    );
  }

  /**
   * disconnect user
   */
  logOut() {
    localStorage.clear();
    location.reload();
  }

  /**
   * Update the password of an unregistred user
   * @param email string
   * @param password string
   * @returns Observable<TokenResponse>
   */
  login(email: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(backendUrl + "/auth/jwt/create/", {
        username: email,
        password: password,
      })
      .pipe(
        tap((value: TokenResponse) => {
          localStorage.setItem("token", value.access);
          localStorage.setItem("refresh", value.refresh);
        })
      );
  }

  /**
   * refresh Token
   * @returns TokenResponse
   */
  refreshToken(): Observable<{ access: string; refresh: string }> {
    return this.http
      .post<{ access: string; refresh: string }>(
        backendUrl + "/auth/jwt/refresh/",
        {
          refresh: localStorage.getItem("refresh"),
        }
      )
      .pipe(
        tap((value) => {
          localStorage.setItem("token", value.access);
          localStorage.setItem("refresh", value.refresh);
        })
      );
  }
}

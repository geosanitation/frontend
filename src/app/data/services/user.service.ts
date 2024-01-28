import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment as env } from "../../../environments/environment";
import { Observable } from "rxjs";
import { PasswordConfirmation, User } from "../models/account";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  /**
   * Get sorted users
   * @returns
   */
  getSortedUsers(sort: string): Observable<Array<User>> {
    return this.http.get<Array<User>>(
      env.backendUrl + "/api/account/users?" + sort
    );
  }

  /**
   * Get user by email
   * @returns
   */
  userByEmailOrUsername(email: string) {
    return this.http.post<User>(
      env.backendUrl + "/api/account/user-by-emailoruname",
      {
        username: email,
      }
    );
  }

  /**
   * Get user by slug
   * @returns
   */
  getUserSlug(slug: string): Observable<User> {
    return this.http.get<User>(
      env.backendUrl + "/api/account/user-by-slug/" + slug
    );
  }

  /**
   * Create an user
   * @param data FormData
   * @returns
   */
  createUser(data: FormData): Observable<User> {
    return this.http.post<User>(env.backendUrl + "/auth/users/", data);
  }

  /**
   * Edit an user
   * @param user User
   * @param id number
   * @returns
   */
  updateUser(user: FormData, id: number): Observable<User> {
    return this.http.patch<User>(
      env.backendUrl + "/api/account/user/" + id,
      user
    );
  }

  /**
   * Edit an user
   * @param user User
   * @param id number
   * @returns
   */
  updateProfilUser(user: User): Observable<User> {
    return this.http.patch<User>(env.backendUrl + "/auth/users/me/", user);
  }

  /**
   * Update password of connected user, if old password is correct
   * @param old_password
   * @param new_password
   * @returns
   */
  updatePassword(
    old_password: string,
    new_password: string
  ): Observable<PasswordConfirmation> {
    return this.http.post<PasswordConfirmation>(
      env.backendUrl + "/api/account/update-password",
      { old_password, new_password }
    );
  }

  /**
   * Edit password user
   * @param user User
   * @param id number
   * @returns
   */
  updatePasswordUser(user: {
    password: string;
    slug: string;
  }): Observable<User> {
    return this.http.put<User>(
      env.backendUrl + "/api/account/user/update-password-with-slug",
      user
    );
  }

  /**
   * Send mail for user forget password
   * @param user User
   * @param id number
   * @returns
   */
  userForgotPassword(email: string) {
    return this.http.post<string>(
      env.backendUrl + "/api/account/forgot-password",
      { email }
    );
  }
}

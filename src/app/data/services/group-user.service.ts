import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GroupUser } from "../models/account";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class GroupUserService {
  constructor(private http: HttpClient) {}

  /**
   * Get all groups
   * @returns
   */
  getAllGroupUsers(sort?: string): Observable<GroupUser[]> {
    return this.http.get<GroupUser[]>(
      environment.backendUrl + "/api/account/group?" + sort
    );
  }

  /**
   * Create a group
   * @param data GroupUser
   * @returns
   */
  createGroupUser(data: GroupUser): Observable<GroupUser> {
    return this.http.post<GroupUser>(
      environment.backendUrl + "/api/account/group",
      data
    );
  }

  /**
   * Get group by id
   * @param group_id number
   * @returns
   */
  getGroupUserById(group_id: number): Observable<GroupUser> {
    return this.http.get<GroupUser>(
      environment.backendUrl + "/api/account/group/" + group_id
    );
  }

  /**
   * Update a group
   * @param group_id Number
   * @param data FormData
   * @returns
   */
  editGroupUser(group_id: number, data: GroupUser): Observable<GroupUser> {
    return this.http.patch<GroupUser>(
      environment.backendUrl + "/api/account/group/" + group_id,
      data
    );
  }

  /**
   * Delete a group
   * @param group_id number
   * @returns
   */
  deleteGroupUser(group_id: number) {
    return this.http.delete(
      environment.backendUrl + "/api/account/group/" + group_id
    );
  }
}

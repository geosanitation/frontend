import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment as env } from "../../../environments/environment";
import { GroupsRight, LayersRight, Right } from "../models/account";

@Injectable({
  providedIn: "root",
})
export class RightService {
  constructor(private http: HttpClient) {}

  /**
   * save the list of Right
   * @param data list of Right
   * @returns Observable<Right[]>
   */
  saveRight(data: any): Observable<Right[]> {
    return this.http.post<Array<Right>>(
      env.backendUrl + "/api/account/right/save-group-layer-right",
      data
    );
  }

  /**
   * Get users right
   * @returns
   */
  getGroupsByLayer(layerId: number): Observable<GroupsRight> {
    return this.http.get<GroupsRight>(
      env.backendUrl +
        "/api/account/right/groups-right-by-layer?layer_id=" +
        layerId
    );
  }

  /**
   * Get layers right
   * @returns
   */
  getLayersByGroup(id: number): Observable<LayersRight> {
    return this.http.get<LayersRight>(
      env.backendUrl + "/api/account/right/layers-right-by-group?group_id=" + id
    );
  }
}

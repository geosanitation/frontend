import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
// import { NotifierService } from "angular-notifier";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { TransactionResponse } from "ol/format/WFS";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { GroupUser, User } from "../models/account";
import {
  DataJoinCount,
  Group,
  GroupWithLayers,
  Layer,
  LayerProviders,
  Map,
  Metadata,
  Parcelle,
  ProjectionResult,
  ReorderProvider,
  Tag,
} from "../models/type";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class MapsService {
  headers: HttpHeaders = new HttpHeaders({});
  url_prefix = environment.backendUrl;
  // private readonly notifier: NotifierService;

  constructor(private http: HttpClient) {
    this.headers.append("Content-Type", "application/x-www-form-urlencoded");
    this.headers.append("Content-Type", "application/json");
    // this.notifier = notifierService;
  }

  /**
   * Get header
   * @returns HttpHeaders
   */
  get_header(): HttpHeaders {
    this.headers = this.headers.set(
      "Authorization",
      "Bearer  " + localStorage.getItem("token")
    );
    return this.headers;
  }

  /**
   * Search map
   * @param search_word string
   * @returns Observable<Map[]>
   */
  searchMap(search_word: string): Observable<Map[]> {
    return this.http.post<Map[]>(
      this.url_prefix + "/api/map/map/search",
      { search_word: search_word },
      { headers: this.get_header() }
    );
  }

  /**
   * get all maps
   * @returns Observable<Map[]>
   */
  getAllMaps(): Observable<Map[]> {
    return this.http.get<Map[]>(this.url_prefix + "/api/map/map", {
      headers: this.get_header(),
    });
  }

  /**
   * get a map
   * @param map Map
   * @returns Observable<Map>
   */
  getMap(id: number): Observable<Map> {
    return this.http.get<Map>(this.url_prefix + "/api/map/map/" + id, {
      headers: this.get_header(),
    });
  }

  /**
   * update a map
   * @param map Map
   * @returns Observable<Map>
   */
  updateMap(map: Map): Observable<Map> {
    return this.http.put<Map>(
      this.url_prefix + "/api/map/map/" + map.map_id,
      map,
      { headers: this.get_header() }
    );
  }

  /**
   * add a map
   * @param map Map
   * @returns Observable<Map>
   */
  addMap(map: Map): Observable<Map> {
    return this.http.post<Map>(this.url_prefix + "/api/map/map", map, {
      headers: this.get_header(),
    });
  }

  /**
   * Delete a Map
   * @param map Map
   */
  deleteMap(map: Map): Observable<HttpResponse<any>> {
    return this.http.delete<HttpResponse<any>>(
      this.url_prefix + "/api/map/map/" + map.map_id,
      { headers: this.get_header() }
    );
  }

  /**
   * Add a group
   * @param group Group
   */
  addGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(this.url_prefix + "/api/map/groups", group, {
      headers: this.get_header(),
    });
  }

  /**
   * get a group
   * @param group Group
   */
  getGroup(group_id: number): Observable<GroupWithLayers> {
    return this.http.get<GroupWithLayers>(
      this.url_prefix + "/api/map/group/" + group_id,
      // { headers: this.get_header() }
    );
  }

  /**
   * Update a group
   * @param group Group
   */
  updateGroup(group: Group): Observable<Group> {
    return this.http.put<Group>(
      this.url_prefix + "/api/map/group/" + group.group_id,
      group,
      { headers: this.get_header() }
    );
  }

  /**
   * Delete group
   * @param group Group
   */
  deleteGroup(group: Group): Observable<HttpResponse<any>> {
    return this.http.delete<HttpResponse<any>>(
      this.url_prefix + "/api/map/group/" + group.group_id,
      { headers: this.get_header() }
    );
  }

  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(
      this.url_prefix + "/api/map/groups",
      // { headers: this.get_header() }
    );
  }

  /**
   * Get group with layers
   * @param group_id number
   */
  getAllGroupWithLayers(): Observable<GroupWithLayers[]> {
    return this.http.get<GroupWithLayers[]>(
      this.url_prefix + "/api/map/group/layers",
      // { headers: this.get_header() }
    );
  }

  /**
   * Get group with layers by map
   * @param group_id number
   */
  getGroupWithLayersByMap(mapId: number): Observable<GroupWithLayers[]> {
    return this.http.get<GroupWithLayers[]>(
      this.url_prefix + "/api/map/group/layers-map?map_id=" + mapId,
      // { headers: this.get_header() }
    );
  }

  /**
   * Get all layers of a group
   * @param group_id number
   */
  getAllLayersFromGroup(group_id: number): Observable<Layer[]> {
    return this.http.get<Layer[]>(
      this.url_prefix + "/api/map/layer?group=" + group_id,
      { headers: this.get_header() }
    );
  }

  /**
   * Add a layer
   * @param layer Layer
   */
  addLayer(layer: FormData): Observable<Layer[]> {
    return this.http.post<Layer[]>(
      this.url_prefix + "/api/map/layer",
      layer,
      { headers: this.get_header() }
    );
  }

  /**
   * Search a layer
   * @param search_word string
   */
  searchLayer(search_word: string): Observable<Layer[]> {
    return this.http
      .post(
        this.url_prefix + "/api/map/layer/search-layers",
        { search_word: search_word },
        { headers: this.get_header(), reportProgress: true, observe: "events" }
      )
      .pipe(
        map((value: HttpResponse<any>): Layer[] => {
          return value.body;
        })
      );
  }

  /**
   * Search a group
   * @param search_word string
   */
  searchGroups(search_word: string): Observable<GroupUser[]> {
    return this.http
      .post(
        this.url_prefix + "/api/account/right/search-groups",
        { search_word: search_word },
        { headers: this.get_header(), reportProgress: true, observe: "events" }
      )
      .pipe(
        map((value: HttpResponse<any>): GroupUser[] => {
          return value.body;
        })
      );
  }

  /**
   * Search an user
   * @param search_word string
   */
  searchUsers(search_word: string): Observable<User[]> {
    return this.http
      .post(
        this.url_prefix + "/api/account/group/search-users",
        { search_word: search_word },
        { headers: this.get_header(), reportProgress: true, observe: "events" }
      )
      .pipe(
        map((value: HttpResponse<any>): User[] => {
          return value.body;
        })
      );
  }

  /**
   * list of users
   * @param ids users ids
   */
  usersById(ids: { ids: number[] }): Observable<User[]> {
    return this.http
      .post(this.url_prefix + "/api/account/group/users-by-id", ids, {
        headers: this.get_header(),
        reportProgress: true,
        observe: "events",
      })
      .pipe(
        map((value: HttpResponse<any>): User[] => {
          return value.body;
        })
      );
  }

  /**
   * get a layer by old id
   */
  getLayerByOldId(
    layer_id: number
  ): Observable<{ layer: Layer; group: Group }> {
    return this.http.post<{ layer: Layer; group: Group }>(
      this.url_prefix + "/api/map/layer/old",
      { layer_id },
      { headers: this.get_header() }
    );
  }

  /**
   * get a layer by id
   */
  getLayer(layer_id: number): Observable<Layer> {
    return this.http.get<Layer>(
      this.url_prefix + "/api/map/layer/" + layer_id,
      // { headers: this.get_header() }
    );
  }

  /**
   * update a layer
   * @param layer_id number
   */
  updateLayer(layer: FormData, layerId: number): Observable<Layer> {
    return this.http.put<Layer>(
      this.url_prefix + "/api/map/layer/" + layerId,
      layer,
      { headers: this.get_header() }
    );
  }

  /**
   * delete a layer
   * @param layer_id number
   */
  deleteLayer(layer_id: number) {
    return this.http.delete(this.url_prefix + "/api/map/layer/" + layer_id, {
      headers: this.get_header(),
    });
  }

  /**
   * add provider with style to a layer
   */
  addProviderWithStyleToLayer(parameter: {
    layer_id: number;
    vs_id: number;
    vp_id: number;
  }): Observable<LayerProviders> {
    return this.http.post<LayerProviders>(
      this.url_prefix + "/api/map/layer/provider",
      parameter,
      { headers: this.get_header() }
    );
  }

  /**
   * update a provider of a layer
   */
  updateProviderWithStyleOfLayer(
    layerProviders_id,
    parameter: { layer_id: number; vs_id: number; vp_id: number }
  ): Observable<LayerProviders> {
    return this.http.put<LayerProviders>(
      this.url_prefix + "/api/map/layer/provider/" + layerProviders_id,
      parameter,
      { headers: this.get_header() }
    );
  }

  /**
   * get all providers of a map
   */
  getProviderWithStyleOfLayer(
    layer_id: number
  ): Observable<Array<LayerProviders>> {
    return this.http.get<Array<LayerProviders>>(
      this.url_prefix + "/api/map/layer/provider?layer_id=" + layer_id,
      { headers: this.get_header() }
    );
  }

  /**
   * dedelete a provider in a layer providers
   * @param id number
   */
  deleteProviderWithStyleOfLayer(id: number) {
    return this.http.delete(
      this.url_prefix + "/api/map/layer/provider/" + id,
      { headers: this.get_header() }
    );
  }

  /**
   * Re order providers in a layer providers
   * @param reorderProvider ReorderProvider
   */
  reorderProvidersInLayerProviders(reorderProvider: Array<ReorderProvider>) {
    return this.http.post(
      this.url_prefix + "/api/map/layer/provider/reorder",
      { reorderProviders: reorderProvider },
      { headers: this.get_header() }
    );
  }

  /**
   * Search a tag
   * @param search_word string
   * @returns Observable<Array<Tag>>
   */
  searchTags(search_word: string): Observable<Array<Tag>> {
    return this.http.post<Array<Tag>>(
      this.url_prefix + "/api/map/layer/tags/search",
      { search_word: search_word },
      { headers: this.get_header() }
    );
  }

  /**
   * Get Metadata of a layer
   * @param layer_id number
   * @returns Observable<Metadata>
   */
  getLayerMetadata(layer_id: number): Observable<Metadata> {
    return this.http.get<Metadata>(
      this.url_prefix + "/api/map/metadata?layer=" + layer_id,
      { headers: this.get_header() }
    );
  }

  /**
   * Add Metadata
   * @param metadata
   */
  addMetadata(metadata: Metadata) {
    return this.http.post(this.url_prefix + "/api/map/metadata", metadata, {
      headers: this.get_header(),
    });
  }

  /**
   * update Metadata
   * @param metadata
   */
  updateMetadata(metadata: Metadata) {
    return this.http.put(
      this.url_prefix + "/api/map/metadata/" + metadata.id,
      metadata,
      { headers: this.get_header() }
    );
  }

  /**
   * Search for a projection
   * @param query String
   * @returns
   */
  searchProjection(query: string): Observable<ProjectionResult> {
    return this.http.get<ProjectionResult>(
      "https://epsg.io/?format=json&q=" + query
    );
  }

  /**
   * Add, update or delete features
   * @param querry WFS query params
   * @returns  Observable<any>
   */
  manageFeatures(query: string, data: string): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(
      this.url_prefix + "/api/map/manage-features?" + query,
      { data: data }
    );
  }

  /**
   * Get data of join tables
   * @param layer_id: number
   * @param join_tables: string
   * @param limit: number
   * @param page: number
   * @returns  Observable<DataJoinCount>
   */
  getDataJoinTables(
    layer_id: number,
    join_tables: string,
    limit: number,
    page: number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      this.url_prefix +
        "/api/map/data-join-table?layer_id=" +
        layer_id +
        "&join_tables=" +
        join_tables +
        "&limit=" +
        limit +
        "&page=" +
        page,
      { headers: this.get_header() }
    );
  }

  /**
   * Get data join count
   * @param layer_id: number
   * @param join_tables: string
   * @returns  Observable<DataJoinCount>
   */
  getDataJoinCount(
    layer_id: number,
    join_tables: string
  ): Observable<DataJoinCount> {
    return this.http.get<DataJoinCount>(
      this.url_prefix +
        "/api/map/count-join-table?layer_id=" +
        layer_id +
        "&join_tables=" +
        join_tables,
      { headers: this.get_header() }
    );
  }

  /**
   * update a data table
   * @param style FormData
   * @returns Observable<any>
   */
  replaceJoinTable(data: FormData | Object): Observable<any> {
    return this.http.post<any>(
      this.url_prefix + "/api/map/replace-join-table",
      data,
      { headers: this.get_header() }
    );
  }

  /**
   * Download entities
   * @param layer_id: number
   * @param join_tables: string
   * @returns  Observable<Blob>
   */
  downloadFeatures(layer_id: number, join_tables: string): Observable<Blob> {
    return this.http.get(
      this.url_prefix +
        "/api/map/download-data-join-table?layer_id=" +
        layer_id +
        "&join_tables=" +
        join_tables,
      { responseType: "blob" }
    );
  }

  /**
   * Get a parcelle
   * @param parcelle Parcelle
   */
  getParcelle(id: number): Observable<GeoJSONFeatureCollection> {
    return this.http.get<GeoJSONFeatureCollection>(
      this.url_prefix + "/api/map/land/get-geojson/" + id,
      { headers: this.get_header() }
    );
  }
}

import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  FeatureProperties,
  Layer,
  responseOfSerachEntityInterface,
} from "../models/type";

@Injectable({
  providedIn: "root",
})
export class SearchLayerService {
  headers: HttpHeaders = new HttpHeaders({});
  url_prefix = environment.backendUrl;

  constructor(private http: HttpClient) {
    this.headers.append("Content-Type", "application/x-www-form-urlencoded");
    this.headers.append("Content-Type", "application/json");
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

  searchLayer(querry: string): Observable<Layer[]> {
    return this.http.post<Layer[]>(
      this.url_prefix + "/api/map/layer/search",
      { search_word: querry },
      { headers: this.get_header() }
    );
  }

  searchEntity(querry: string): Observable<responseOfSerachEntityInterface[]> {
    return this.http.post<responseOfSerachEntityInterface[]>(
      this.url_prefix + "/api/data-provider/entite/search",
      { search_word: querry },
      { headers: this.get_header() }
    );
  }

  searchParcelle(query: string): Observable<Layer[]> {
    return this.http.post<Layer[]>(
      this.url_prefix + "/api/map/land/search-lands",
      { search_word: query },
      { headers: this.get_header() }
    );
  }

  displayEntity(
    feature_id: number,
    provider_vector_id: number
  ): Observable<FeatureProperties[]> {
    return this.http.post<FeatureProperties[]>(
      this.url_prefix + "/api/data-provider/entite/display",
      { feature_id: feature_id, provider_vector_id: provider_vector_id },
      { headers: this.get_header() }
    );
  }
}

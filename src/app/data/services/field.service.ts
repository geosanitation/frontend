import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeoJSONFeatureCollection } from 'ol/format/GeoJSON';
import { Observable } from 'rxjs';
import {
  CustomField, FeatureCount, Field
} from '../models/type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  headers: HttpHeaders = new HttpHeaders({});
  url_prefix = environment.backendUrl;

  constructor(private http: HttpClient) {
    this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
    this.headers.append('Content-Type', 'application/json');
  }

  /**
   * Get header
   * @returns HttpHeaders
   */
  get_header(): HttpHeaders {
    this.headers = this.headers.set(
      'Authorization',
      'Bearer  ' + localStorage.getItem('token')
    );
    return this.headers;
  }

  /**
   * get all fields of a vector provider
   * @param typename string
   * @param map string
   * @returns Observable<Fields[]>
   */
  getAllFieldsOfVectorProvider(query: string): Observable<Field[]> {
    return this.http.get<Array<Field>>(
      this.url_prefix + '/api/data-provider/vector/fields?' + query,
      { headers: this.get_header() }
    );
  }

  /**
   * get custom fields of a vector provider
   * @param typename string
   * @param map string
   * @returns Observable<CustomFields[]>
   */
  getCustomFieldsOfVectorProvider(
    query: string,
  ): Observable<CustomField[]> {
    return this.http.get<Array<CustomField>>(
      this.url_prefix + '/api/data-provider/field/custom?' + query,
      { headers: this.get_header() }
    );
  }

  /**
   * save the list of customfields
   * @param data list of custom fields
   * @returns Observable<CustomField[]>
   */
  saveCustomFields(data: {
    custom_fields: Array<CustomField>,
    provider_vector_id: number,
  }): Observable<CustomField[]> {
    return this.http.post<Array<CustomField>>(
      this.url_prefix + '/api/data-provider/field/save-custom',
      data
    );
  }

  /**
   * Get features for attribute tables
   * @param querry WFS query params
   * @returns Observable<GeoJson>
   */
  getFeatures(querry:string): Observable<GeoJSONFeatureCollection> {
    return this.http.get<GeoJSONFeatureCollection>(
      this.url_prefix + '/api/data-provider/vector/features?' + querry,
      { headers: this.get_header() }
    );
  }

  /**
   * Get features count
   * @param querry WFS query params
   * @returns  Observable<FeatureCount>
   */
  getFeaturesCount(querry: string): Observable<FeatureCount> {
    return this.http.get<FeatureCount>(
      this.url_prefix + '/api/map/wfs?' + querry,
      { headers: this.get_header() }
    );
  }

    /**
   * Download features
   * @param querry WFS query params
   * @returns  Observable<any>
   */
  downloadFeatures(query: string):  Observable<Blob> {
    return this.http.get(
      this.url_prefix + '/api/map/download-features?' + query,
      { responseType: 'blob' }
    );
  }
}

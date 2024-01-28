import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LayerField } from '../models/layer-field';
import { CustomStyle, HttpResponse, Style} from '../models/type';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  headers: HttpHeaders = new HttpHeaders({});
  url_prefix = environment.backendUrl

  constructor(
    private http: HttpClient

  ) {
    this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
    this.headers.append('Content-Type', 'application/json');
  }

  /**
* Get header
* @returns HttpHeaders
*/
  get_header(): HttpHeaders {
    this.headers = this.headers.set('Authorization', 'Bearer  ' + localStorage.getItem('token'))
    return this.headers
  }

  /**
   * get all styles of a vector provider
   * @param provider_vector_id number
   * @returns Observable<Style[]>
   */
  getStyleOfVectorProvider(provider_vector_id: number): Observable<Style> {
    return this.http.get<Style>(this.url_prefix + '/api/data-provider/style/vector/' + provider_vector_id, { headers: this.get_header() })
  }

  /**
   * update a style
   * @param style FormData
   * @returns Observable<Style>
   */
  updateStyle(style: FormData | Object): Observable<Style> {
    let provider_style_id
    if (style instanceof FormData) {
      provider_style_id = style.get('provider_style_id')
    } else {
      provider_style_id = style['provider_style_id']
    }
    return this.http.put<Style>(this.url_prefix + '/api/data-provider/style/' + provider_style_id, style, { headers: this.get_header() })
  }

  /**
  * delete a style
  * @param provider_style_id number
  * @returns Observable<Style>
  */
  deleteStyle(provider_style_id: number): Observable<HttpResponse> {
    return this.http.delete<HttpResponse>(this.url_prefix + '/api/data-provider/style/' + provider_style_id, { headers: this.get_header() })
  }

  /**
   * add a style
   * @param style FormData
   * @returns Observable<Style>
   */
  addStyle(style: FormData | Object): Observable<Style> {
    let provider_vector_id
    if (style instanceof FormData) {
      provider_vector_id = style.get('provider_vector_id')
    } else {
      provider_vector_id = style['provider_vector_id']
    }
    return this.http.post<Style>(this.url_prefix + '/api/data-provider/style/vector/' + provider_vector_id, style, { headers: this.get_header() })
  }

  /**
  * list all custom styles
  * @returns Observable<Style>
  */
  listCustomStyles(): Observable<CustomStyle[]> {
    return this.http.get<CustomStyle[]>(this.url_prefix + '/api/data-provider/style/custom', { headers: this.get_header() })
  }

  /**
  * list all custom styles of a geometryType
  * @returns Observable<Style>
  */
  listCustomStylesOfGeometryType(geometryType: 'Point' | 'Polygon' | 'LineString' | 'null'): Observable<CustomStyle[]> {
    return this.http.get<CustomStyle[]>(this.url_prefix + '/api/data-provider/style/custom?geometry_type=' + geometryType, { headers: this.get_header() })
  }


  /**
   * get all fields of a vector layer
   * @param layerName string
   * @param projectName string
   * @returns Observable<Style[]>
   */
  getAllFieldsOfVectorLayer(layerName: string, projectName: string, fieldType?: 'number' | 'string'): Observable<LayerField[]> {
    let query = "MAP="+projectName+"&SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType&TYPENAME="+layerName

    let url = this.url_prefix + '/api/data-provider/vector/fields?'+query
    if (fieldType) {
      url = this.url_prefix + '/api/data-provider/vector/fields?'+query+'&field_type='+fieldType
    }
    return this.http.get<Array<LayerField>>(url, { headers: this.get_header() })
  }


}

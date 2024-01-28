import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Feature, Geometry } from '../../ol-module';
import { AdminBoundary, AdminBoundaryFeature, AdminBoundaryRespone, AppExtent, Connection, Parameter } from '../models/parameters';
import { Map } from '../models/type';

@Injectable({
  providedIn: 'root'
})
export class ParametersService {

  headers: HttpHeaders = new HttpHeaders({});
  url_prefix = environment.backendUrl
  /**
   * List of app extents with geometry
   */
  lisAppExtent$: BehaviorSubject<AppExtent[]> = new BehaviorSubject<AppExtent[]>([])

  parameter: Parameter
  /**
   * Polygon of the project 
   */
  projectPolygon: Feature<Geometry>
  /**
   * Actif profil id
   */
  map_id: number

  /**
 * Active application
 */
  current_application: Map

  /**
   * Active profile basemap id
   */
  basemap_id: number

  private menuMapClicked:Subject<void> = new BehaviorSubject<void>(null);

  constructor(
    private http: HttpClient,
  ) {
    this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
    this.headers.append('Content-Type', 'application/json');

  }

  get menuMapClicked$(){
    return this.menuMapClicked.asObservable();
  }

  updateMapClicked() {
    this.menuMapClicked.next();
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
   * Get parameters of the app
   * @returns Observable<Parameter> 
   */
  getParameters(): Observable<Parameter> {
    return this.http.get<Parameter[]>(this.url_prefix + '/api/parameter/parameter', { headers: this.get_header() }).pipe(
      map((response) => {
        if (response.length > 0) {
          this.parameter = response[0]
          return response[0]
        }
        return {} as Parameter
      })
    )
  }

  /**
   * Add a adminBoundary
   * @param adminBoundary AdminBoundary
   * @returns Observable<any>
   */
  addAdminstrativeBoundary(adminBoundary: any): Observable<any> {
    return this.http.post<any>(this.url_prefix + '/api/parameter/admin_boundary', adminBoundary, { headers: this.get_header() })
  }

  /**
   * update a adminBoundary
   * @param adminBoundary AdminBoundary
   * @returns Observable<any>
   */
  updateAdminstrativeBoundary(adminBoundary: AdminBoundary): Observable<any> {
    return this.http.put<any>(this.url_prefix + '/api/parameter/admin_boundary/' + adminBoundary.admin_boundary_id, adminBoundary, { headers: this.get_header() })
  }

  /**
   * destroy a adminBoundary
   * @param adminBoundary AdminBoundary
   * @returns Observable<any>
   */
  destroyAdminstrativeBoundary(admin_boundary_id: number): Observable<any> {
    return this.http.delete<any>(this.url_prefix + '/api/parameter/admin_boundary/' + admin_boundary_id, { headers: this.get_header() })
  }

  /**
   * Add a parameter
   * @param parameter Parameter
   * @returns Observable<any>
   */
  addParameter(parameter: any): Observable<any> {
    return this.http.post<any>(this.url_prefix + '/api/parameter/parameter/add', parameter, { headers: this.get_header() })
  }

  /**
   * update a parameter
   * @param parameter Parameter
   * @returns Observable<any>
   */
  updateParameter(parameter: any): Observable<any> {
    return this.http.put<any>(this.url_prefix + '/api/parameter/parameter/' + parameter.parameter_id, parameter, { headers: this.get_header() })
  }

  /**
   * get the app extent 
   * @param geometry boolean
   * @param tolerance number the tolrance to simplify the geometry with ST_SimplifyPreserveTopology function
   * @returns Observable<AppExtent>
   */
  getAppExtent(geometry: boolean = false, tolerance: number = 0): Observable<AppExtent> {
    return this.http.get<AppExtent>(this.url_prefix + '/api/parameter/extent?geometry=' + geometry + '&tolerance=' + tolerance, { headers: this.get_header() })

  }

  /**
   * get one app extent by id with his extent
   * @returns Observable<AppExtent>
   */
  getAppExtentById(id: number): Observable<AppExtent> {
    return this.http.post<AppExtent>(this.url_prefix + '/api/parameter/extent/get', { id: id }, { headers: this.get_header() })

  }
  /**
   * get the list of app extent
   * @param geometry boolean
   * @param tolerance number the tolrance to simplify the geometry with ST_SimplifyPreserveTopology function
   * @returns Observable<AppExtent[]>
   */
  getListAppExtent(geometry: boolean = false, tolerance: number = 0): Observable<AppExtent[]> {
    return this.http.get<AppExtent[]>(this.url_prefix + '/api/parameter/extent/list?geometry=' + geometry + '&tolerance=' + tolerance, { headers: this.get_header() })
  }

  /**
   * Search admin boundary
   * @param querry string
   * @returns Observable<AdminBoundaryRespone[]>
   */
  searchAdminBoundary(querry: string): Observable<AdminBoundaryRespone[]> {
    return this.http.post<AdminBoundaryRespone[]>(this.url_prefix + "/api/parameter/admin_boundary/search", { search_word: querry }, { headers: this.get_header() })
  }

  /**
   * Get a admin boundary feature with his geometry
   * @param provider_vector_id number
   * @param table_id number
   * @returns Observable<AdminBoundaryFeature>
   */
  getAdminBoundaryFeature(provider_vector_id: number, table_id: number): Observable<AdminBoundaryFeature> {
    return this.http.post<AdminBoundaryFeature>(this.url_prefix + "/api/parameter/admin_boundary/feature", { vector_id: provider_vector_id, table_id: table_id }, { headers: this.get_header() })
  }

  /**
   * Add a connection
   * @param connection Connection
   * @returns Observable<any>
   */
  addConnection(connection: Connection): Observable<any> {
    return this.http.post<any>(
      this.url_prefix + '/api/parameter/connection/add',
      connection,
      { headers: this.get_header() }
    );
  }

  /**
   * Test a connection
   * @param connection Connection
   * @returns Observable<any>
   */
  testConnection(connection: Connection): Observable<any> {
    return this.http.post<any>(
      this.url_prefix + '/api/parameter/connection/test',
      connection,
      { headers: this.get_header() }
    );
  }

  /**
   * Add a connection
   * @param connection Connection
   * @returns Observable<any>
   */
  getConnections(): Observable<any> {
    return this.http.get<any>(
      this.url_prefix + '/api/parameter/connection',
      { headers: this.get_header() }
    );
  }

  /**
   * update a connection
   * @param connection Connection
   * @returns Observable<any>
   */
  updateConnection(connection: Connection): Observable<any> {
    return this.http.put<any>(
      this.url_prefix + '/api/parameter/connection/' + connection.id,
      connection,
      { headers: this.get_header() }
    );
  }

  /**
   * destroy a connection
   * @param id
   * @returns Observable<any>
   */
  destroyConnection(id: number): Observable<any> {
    return this.http.delete<any>(
      this.url_prefix + '/api/parameter/connection/' + id,
      { headers: this.get_header() }
    );
  }

}
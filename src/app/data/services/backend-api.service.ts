import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResultOfDigitalise } from '../models/layer-to-digitalise';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
/**
 * Service to make request to backend or other services
 */
export class BackendApiService {

  headers: HttpHeaders = new HttpHeaders({});
  headers_nodejs: Headers = new Headers({});
  // url_prefix = environment.url_prefix

  constructor(
    private http: HttpClient
  ) {
    this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
    this.headers.append('Content-Type', 'application/json');
    this.headers_nodejs.append('Content-Type', 'application/json');
  }

  /**
   * Get header
   */
  get_header() {
    // this.headers.set('Authorization', 'Bearer  ' + localStorage.getItem('token'))
    return this.headers
  }

  /**
* Make a get request to other host. Here you must specified all the path of your request
* @param string path url
* @return Observable<any>
*/
  getRequestFromOtherHostObserver(path: string): Observable<any> {

    return this.http.get(path, { headers: this.headers })

  }


  /**
* Make a get request to other host. Here you must specified all the path of your request
* @param string path url
* @return Promise<any>
*/
  getRequestFromOtherHost(path: string): Promise<any> {

    let promise = new Promise((resolve, reject) => {
      this.http.get(path, { headers: this.headers })
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { // Error
            reject(msg);
          }
        );
    });

    return promise;
  }

  getFeatureInfoWMS<T>(url:string):Observable<T>{
    return this.http.get<T>(url, { headers: this.headers })
  }

    
  saveDigitaliseData(data:ResultOfDigitalise){
    return this.http.post(environment.backendUrl+'/api/geometry/updateGeometry', data, {headers: this.get_header()})
  }
  
}

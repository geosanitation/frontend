import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { environment } from 'src/environments/environment';
import { VectorProvider } from '../models/type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
/**
 * service to handle vector provider: add, delete, edit etc...
 */
export class VectorProviderService {

  headers: HttpHeaders = new HttpHeaders({});
  url_prefix = environment.backendUrl
  /**
   * list of icons, group by category
   */
  // public vectorProviderList: BehaviorSubject<VectorProvider[]> = new BehaviorSubject(undefined)

  // public vectorProviderListLoadError: BehaviorSubject<boolean> = new BehaviorSubject(false)

  constructor(
    private http: HttpClient,

  ) {
    this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
    this.headers.append('Content-Type', 'application/json');

  }

  /**
   * fecth all list vector provider from backend and store it in observable vectorProviderList
   * If error emit boolean value on observable vectorProviderListLoadError
   */
  fetchAndStoreListVectorProvider(sort:string){
    return this.http.get<VectorProvider[]>(this.url_prefix +'/api/data-provider/vector?'+sort,{ headers: this.get_header() })
  
  }

  /**
   * add  icon
   * @param group 
   * @returns Observable<VectorProvider>
   */
  addVectorProvider(vectorProvicer: VectorProvider):Observable<VectorProvider> {

    return this.http.post<VectorProvider>(this.url_prefix + '/api/data-provider/vector', vectorProvicer, {headers: this.get_header(), reportProgress: true,})
  }

  /**
   * Search an vector provider
   * @param search_word string
   */
  searchVectorProvider(search_word:string):Observable<VectorProvider[]>{
    return this.http.post(this.url_prefix + '/api/data-provider/vector/search', {'search_word':search_word}, { headers: this.get_header(), reportProgress: true, observe: 'events' }).pipe(
      map((value: HttpResponse<any>):VectorProvider[] => { return value.body })
    )
  }

  /**
   * delete vector providers
   * @param provider_vector_ids Array<number>
   * @returns Observable<HttpResponse<any>>
   */
  deleteVectorProvider(provider_vector_ids:Array<number>):Observable<HttpResponse<any>>{
    const options = {
      headers: this.get_header(),
      body: {
        provider_vector_ids: provider_vector_ids,
      },
    };

    return this.http.delete<HttpResponse<any>>(this.url_prefix + '/api/data-provider/vector', options)
   
  }


  /**
   * update vector providers
   * @param provider_vector_ids Vec
   * @returns Observable<HttpResponse<any>>
   */
  updateVectorProvider(provider:VectorProvider):Observable<VectorProvider>{
    return this.http.put<VectorProvider>(this.url_prefix + '/api/data-provider/vector/'+provider.provider_vector_id,provider, { headers: this.get_header() })
  }

  /**
   * get a vector providor by provider_vector_id
   * @param id number 
   * @returns Observable<VectorProvider|HttpErrorResponse>
   */
  getVectorProvider(id:number):Observable<VectorProvider>{
    return this.http.get<VectorProvider>(this.url_prefix +'/api/data-provider/vector/'+id,{ headers: this.get_header() })
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
* Make a get request to Backend
* @param string path url
*/
  getRequest(path: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.http.get(this.url_prefix + path, { headers: this.get_header() })
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


  /**
   * Make a Post request to Backend
   * @param string path url
   * @param Object data
   */
  post_requete(url: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.url_prefix + url, data, {
        headers: this.get_header(), reportProgress: true,
        observe: 'events'
      })
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { // Error

            reject(msg.error);
          }
        );
    });
  }

}

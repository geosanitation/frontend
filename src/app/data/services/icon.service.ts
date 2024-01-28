import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
// import { NotifierService } from "angular-notifier";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Icon, TagsIcon } from "../models/type";
import { environment } from "../../../environments/environment";
@Injectable({
  providedIn: "root",
})
/**
 * get all icons, group of icons, add icons, edit, delete it
 */
export class IconService {
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
   * get all icons group by category
   * @returns Observable<string[]>
   */
  getIconsGroupByCategory(): Observable<Array<{ [key: string]: Icon[] }>> {
    return this.http.get<Array<{ [key: string]: Icon[] }>>(
      this.url_prefix + "/api/map/icons",
      // { headers: this.get_header() }
    );
  }

  /**
   * add  icon
   * @param Icon
   */
  uploadIcon(icon: FormData): Observable<Icon> {
    return from(
      this.http
        .post<Icon>(this.url_prefix + "/api/map/icons", icon, {
          headers: this.get_header(),
          reportProgress: true,
          observe: "events",
        })
        .pipe(
          map((value: HttpResponse<any>): Icon => {
            return value.body;
          })
        )
    );
  }

  /**
   * update  icon
   * @param Icon
   */
  updateIcon(icon: FormData) {
    return this.http.put(
      this.url_prefix + "/api/map/icons/" + icon.get("icon_id"),
      icon,
      { headers: this.get_header() }
    );
  }

  /**
   * delete icon by id
   * @param icon_id number
   */
  deleteIcon(icon_id: number): Observable<Icon> {
    return this.http.delete<Icon>(
      this.url_prefix + "/api/map/icons/" + icon_id,
      { headers: this.get_header() }
    );
  }

  /**
   * Get icon by id
   * @param icon_id number
   */
  getIcon(icon_id: number): Observable<Icon> {
    return this.http.get<Icon>(
      this.url_prefix + "/api/map/icons/" + icon_id,
      { headers: this.get_header() }
    );
  }

  /**
   * Search a tag
   * @param search_word string
   * @returns Observable<Array<Tag>>
   */
  searchIconTags(search_word: string): Observable<Array<TagsIcon>> {
    return this.http.post<Array<TagsIcon>>(
      this.url_prefix + "/api/map/icons/tags/search",
      { search_word: search_word },
      { headers: this.get_header() }
    );
  }

  /**
   * Search an icon
   * @param search_word string
   */
  searchIcon(search_word: string): Observable<Icon[]> {
    return from(
      this.http
        .post(
          this.url_prefix + "/api/map/icons/search",
          { search_word: search_word },
          {
            headers: this.get_header(),
            reportProgress: true,
            observe: "events",
          }
        )
        .pipe(
          map((value: HttpResponse<any>): Icon[] => {
            return value.body;
          })
        )
    );
  }

  /**
   * Make a get request to Backend
   * @param string path url
   */
  getRequest(path: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(this.url_prefix + path, { headers: this.get_header() })
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (msg) => {
            // Error
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
      this.http
        .post(this.url_prefix + url, data, {
          headers: this.get_header(),
          reportProgress: true,
          observe: "events",
        })
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (msg) => {
            // Error

            reject(msg.error);
          }
        );
    });
  }

  /**
   * load svg content
   * @param icon_id number
   */
  loadSvgContent(icon_id: number): Observable<string> {
    return this.http.get(this.url_prefix + "/api/map/icons/svg/" + icon_id, {
      responseType: "text",
      headers: this.get_header(),
    });
  }
}

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { PublicPicture, PublicPicturePaginated } from "../models/risks-hazards";

@Injectable({
  providedIn: "root",
})
export class RisksHazardsService {
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

  /**
   * Get all pictures
   */
  getPublicPictures(params: string): Observable<PublicPicturePaginated> {
    return this.http.get<PublicPicturePaginated>(
      this.url_prefix + `/api/risks-hazards/pictures?${params}`,
      {
        headers: this.get_header(),
      }
    );
  }
  /**
   * Post new picture
   * @param PublicPicture FormData
   */
  addPublicPicture(publicPicture: FormData): Observable<PublicPicture> {
    return this.http.post<PublicPicture>(
      this.url_prefix + "/api/risks-hazards/pictures",
      publicPicture
    );
  }
  /**
   * Update a public picture
   */
  updatePublicPicture(publicPicture: PublicPicture): Observable<PublicPicture> {
    return this.http.patch<PublicPicture>(
      this.url_prefix + `/api/risks-hazards/pictures/${publicPicture.image_id}`,
      publicPicture,
      {
        headers: this.get_header(),
      }
    );
  }

  /**
   * Approve or reject a public picture
   */
  reviewPublicPicture(publicPicture: PublicPicture): Observable<PublicPicture> {
    return this.http.post<PublicPicture>(
      this.url_prefix + `/api/risks-hazards/pictures/${publicPicture.image_id}/review`,
      {is_approved:publicPicture.is_approved},
      {
        headers: this.get_header(),
      }
    );
  }
  /**
   * Delete a public picture
   */
  deletePublicPicture(publicPicture: PublicPicture) {
    return this.http.delete(
      this.url_prefix + `/api/risks-hazards/pictures/${publicPicture.image_id}`,
      {
        headers: this.get_header(),
      }
    );
  }
}

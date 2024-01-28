import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Organization, OrganizationPaginated } from "../models/actors";

@Injectable({
  providedIn: "root",
})
export class ActorsService {
  headers: HttpHeaders = new HttpHeaders({});
  backendUrl = environment.backendUrl;

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

  getOrganizations(params: string): Observable<OrganizationPaginated> {
    return this.http.get<OrganizationPaginated>(
      this.backendUrl + "/api/actors/organizations?" + params,
    );
  }

  addOrganization(organization: Organization): Observable<Organization> {
    return this.http.post<Organization>(
      this.backendUrl + "/api/actors/organizations",
      organization,
      { headers: this.get_header() }
    );
  }

  updateOrganization(organization_id: number, organization: Organization): Observable<Organization> {
    return this.http.patch<Organization>(
      this.backendUrl + "/api/actors/organization/"+organization_id,
      organization,
      { headers: this.get_header() }
    );
  }

  deleteOrganization(organization_id: number): Observable<Organization> {
    return this.http.delete<Organization>(
      this.backendUrl + "/api/actors/organization/"+organization_id,
      { headers: this.get_header() }
    );
  }
}

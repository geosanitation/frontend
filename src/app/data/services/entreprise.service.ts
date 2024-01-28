import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Entreprise } from "../models/account";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class EntrepriseService {
  constructor(private http: HttpClient) {}

  /**
   * Get all entreprises
   * @returns
   */
  getAllEntreprises(sort?: string): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(
      environment.backendUrl + "/api/account/entreprises?" + sort
    );
  }

  /**
   * Create a entreprise
   * @param data Entreprise
   * @returns
   */
  createEntreprise(data: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(
      environment.backendUrl + "/api/account/entreprises",
      data
    );
  }

  /**
   * Get entreprise by id
   * @param entreprise_id number
   * @returns
   */
  getEntrepriseById(entreprise_id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(
      environment.backendUrl + "/api/account/entreprise/" + entreprise_id
    );
  }

  /**
   * Update a entreprise
   * @param entreprise_id Number
   * @param data FormData
   * @returns
   */
  editEntreprise(
    entreprise_id: number,
    data: Entreprise
  ): Observable<Entreprise> {
    return this.http.patch<Entreprise>(
      environment.backendUrl + "/api/account/entreprise/" + entreprise_id,
      data
    );
  }

  /**
   * Delete a entreprise
   * @param entreprise_id number
   * @returns
   */
  deleteEntreprise(entreprise_id: number) {
    return this.http.delete(
      environment.backendUrl + "/api/account/entreprise/" + entreprise_id
    );
  }
}

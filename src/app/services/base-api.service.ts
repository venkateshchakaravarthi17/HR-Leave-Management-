import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  // ✅ Automatically attach WorkEmail and Token
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.auth.getToken();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // ✅ Append WorkEmail to POST / PUT data
  private withWorkEmail(data: any): any {
    const WorkEmail = this.auth.getUserWorkEmail();
    return { ...data, WorkEmail };
  }

  // ✅ Append WorkEmail as query param for GET
  private withWorkEmailParam(params?: HttpParams): HttpParams {
    let httpParams = params || new HttpParams();
    const WorkEmail = this.auth.getUserWorkEmail();
    if (WorkEmail) httpParams = httpParams.set('WorkEmail', WorkEmail);
    return httpParams;
  }

  // 🌐 Generic methods
  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(url, { headers: this.getHeaders(), params: this.withWorkEmailParam(params) });
  }

  post<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(url, this.withWorkEmail(data), { headers: this.getHeaders() });
  }

  put<T>(url: string, data: any): Observable<T> {
    return this.http.put<T>(url, this.withWorkEmail(data), { headers: this.getHeaders() });
  }

  delete<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(url, { headers: this.getHeaders(), params: this.withWorkEmailParam(params) });
  }
}
